import { logger } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

const AssetManager = findByProps("getAssetIds");

enum ActivityTypes {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    // CUSTOM = 4,
    COMPETING = 5
}

// :nyaboom:
function constructActivity() {
    const activity: Activity = {
        name: storage.app_name || "Discord",
        application_id: storage.application_id || "1054951789318909972",
        flags: 0,
        type: ActivityTypes.PLAYING, // PLAYING
        state: storage.state,
        details: storage.details
    };

    // Construct timestamps
    if (storage.enable_timestamps) {
        const timestamps = {} as any;

        timestamps.start = Number(storage.start_timestamp) || Date.now();
        if (!isNaN(storage.end_timestamp)) timestamps.end = Number(storage.end_timestamp);

        activity.timestamps = timestamps;
    }

    // Construct assets
    const assets = {} as ActivityAssets;

    if (storage.large_image) {
        assets.large_image = storage.large_image;
        if (storage.large_image_text) assets.large_text = storage.large_image_text;
    }

    if (storage.small_image) {
        assets.small_image = storage.small_image;
        if (storage.small_image_text) assets.small_text = storage.small_image_text;
    }

    if (Object.keys(assets).length) activity.assets = assets;

    // Construct buttons
    if (storage.button1_text && storage.button1_URL) {
        activity.buttons = [
            { label: storage.button1_text, url: storage.button1_URL }
        ];
    }

    if (storage.button2_text && storage.button2_URL) {
        (activity.buttons ??= []).push({ label: storage.button2_text, url: storage.button2_URL });
    }

    return activity;
}

async function sendRequest(activity: Activity | null): Promise<Activity> {
    if (typeof activity !== "object") throw new Error("Invalid activity");

    if (activity?.assets) {
        const [largeImage, smallImage] = await AssetManager.getAssetIds(activity.application_id, [activity.assets.large_image, activity.assets.small_image]);
        activity.assets.large_image = largeImage;
        activity.assets.small_image = smallImage;
    }

    if (activity?.buttons?.length) {
        activity.buttons = activity.buttons.filter(x => x.label && x.url);
        Object.assign(activity, {
            metadata: { button_urls: activity.buttons.map(x => x.url) },
            buttons: activity.buttons.map(x => x.label)
        });
    }

    // validate activity
    for (const k in activity) {
        if (activity[k] === undefined || activity[k] === null) delete activity[k];
        if (typeof activity[k].length === "number" && activity[k].length === 0) delete activity[k];
        if (typeof activity[k] === "object" && Object.keys(activity[k]).length === 0) delete activity[k];
        if (typeof activity[k] === "object" && activity[k].length === 0) delete activity[k];
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
        sendRequest(constructActivity()).catch().then(x => {
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
