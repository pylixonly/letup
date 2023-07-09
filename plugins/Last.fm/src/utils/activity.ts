import { FluxDispatcher } from "@vendetta/metro/common";

import { pluginState, verboseLog } from "..";
import { Activity } from "../../../defs";
import Constants from "../constants";
import { AssetManager } from "../modules";

/** Clears the user's activity */
export function clearActivity() {
    pluginState.lastActivity && verboseLog("--> Clearing activity...");
    return sendRequest(null);
}

/** Sends the activity details to Discord  */
export function sendRequest(activity: Activity) {
    if (pluginState.pluginStopped) {
        console.log("--> Plugin is unloaded, aborting...");
        pluginState.updateInterval && clearInterval(pluginState.updateInterval);
        activity = null;
    }

    pluginState.lastActivity = activity;

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity,
        pid: 2312,
        socketId: "Last.fm@Vendetta"
    });
}

/** Fetches a Discord application's asset */
export async function fetchAsset(asset: string[], appId: string = Constants.APPLICATION_ID): Promise<string[]> {
    if (!asset) return [];

    const assetIds = AssetManager.getAssetIds(appId, asset);
    if (assetIds.length > 0) return assetIds;

    return await AssetManager.fetchAssetIds(appId, asset);
}
