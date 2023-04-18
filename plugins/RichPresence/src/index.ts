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

if (!storage.selected) {
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

async function sendRequest(activity: Activity | null): Promise<Activity> {
    if (typeof activity !== "object") throw new Error("Invalid activity");

    const timestampEnabled = activity?.timestamps?._enabled;
    activity = cloneAndFilter(activity);

    if (timestampEnabled) {
        delete activity.timestamps._enabled;
        activity.timestamps.start ||= pluginStartSince;
    } else {
        delete activity.timestamps;
    }

    if (activity?.assets) {
        const [largeImage, smallImage] = await AssetManager.getAssetIds(activity.application_id, [activity.assets.large_image, activity.assets.small_image]);
        activity.assets.large_image = largeImage;
        activity.assets.small_image = smallImage;
    }

    if (activity?.buttons?.length) {
        activity.buttons = activity.buttons.filter(x => x.label && x.url);
        activity.buttons.length && Object.assign(activity, {
            metadata: { button_urls: activity.buttons.map(x => x.url) },
            buttons: activity.buttons.map(x => x.label)
        });
    }

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity
    });

    return activity;
}

export default new class RichPresence {
    onLoad() {
        logger.log("Sending RPC request");

        const currentActivity = storage.selections[storage.selected];
        sendRequest(currentActivity).catch().then(x => {
            logger.log("RPC request sent");
            console.log(x);
        });
    }

    onUnload() {
        logger.log("Stopping RPC request");
        sendRequest(null);
    }

    settings = Settings;
};
