import { FluxDispatcher } from "@vendetta/metro/common";

import { pluginState } from "..";
import { Activity } from "../../../defs";
import Constants from "../constants";
import { flush } from "../manager";
import { AssetManager } from "../modules";

/** Clears the user's activity */
export function clearActivity() {
    return sendRequest(null);
}

/** Sends the activity details to Discord  */
export function sendRequest(activity: Activity) {
    if (pluginState.pluginStopped) {
        flush(true);
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

    return await AssetManager.fetchAssetIds(appId, asset);
}
