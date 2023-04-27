import { logger, plugin } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";
import { cloneAndFilter } from "./utils";

enum ActivityTypes {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    // CUSTOM = 4,
    COMPETING = 5
}

const AssetManager = findByProps("getAssetIds");
const pluginStartSince = Date.now();

const storage = plugin.storage as typeof plugin.storage & {
    selected: string;
    selections: Record<string, Activity>;
};

if (typeof storage.selected?.length !== "number") {
    Object.assign(storage, {
        selected: "default",
        selections: {
            default: createDefaultSelection()
        }
    });
}

function createDefaultSelection(): Activity {
    return {
        name: "Discord",
        application_id: "1054951789318909972",
        flags: 0,
        type: ActivityTypes.PLAYING,
        timestamps: {
            _enabled: false,
            start: pluginStartSince
        },
        assets: {},
        // @ts-ignore
        buttons: [{}, {}]
    };
}

async function sendRequest(activity: Activity | null): Promise<{ [K in keyof Activity]: any } & Record<string, any>> {
    if (typeof activity !== "object") throw new Error("Invalid activity");

    const timestampEnabled = activity?.timestamps?._enabled;
    activity = cloneAndFilter(activity);

    if (timestampEnabled) {
        activity.timestamps.start ||= pluginStartSince;
    } else {
        delete activity.timestamps;
    }

    if (activity?.assets) {
        const args = [activity.application_id, [activity.assets.large_image, activity.assets.small_image]];

        let assetIds = AssetManager.getAssetIds(...args);
        if (!assetIds.length) assetIds = await AssetManager.fetchAssetIds(...args);

        activity.assets.large_image = assetIds[0];
        activity.assets.small_image = assetIds[1];
    }

    if (activity?.buttons?.length) {
        activity.buttons = activity.buttons.filter(x => x.label && x.url);
        activity.buttons.length
            ? Object.assign(activity, {
                metadata: { button_urls: activity.buttons.map(x => x.url) },
                buttons: activity.buttons.map(x => x.label)
            })
            : delete activity.buttons;
    }

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity,
        pid: 1608,
        socketId: "RichPresence@Vendetta"
    });

    return activity;
}

export default new class RichPresence {
    onLoad() {
        logger.log("Sending RPC request");

        const currentActivity = storage.selections[storage.selected];
        if (!currentActivity) {
            throw new Error("Selected activity does not exist");
        }

        sendRequest(currentActivity)
            .then(x => {
                logger.log("RPC request sent");
                logger.log(x);
            }).catch(e => {
                logger.error("An error occured while sending RPC request :(");
                logger.error(e?.stack ?? e);
            });
    }

    onUnload() {
        logger.log("Stopping RPC request");
        sendRequest(null);
    }

    settings = Settings;
};
