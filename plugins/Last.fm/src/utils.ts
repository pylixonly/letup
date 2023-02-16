import { findByProps } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { currentSettings, global, verboseLog } from ".";
import Constants from "./constants";

const AssetManager = findByProps("getAssetIds");

/** Fetches the latest user's scrobble */
async function fetchLatestScrobble(): Promise<Track> {
    const params = new URLSearchParams({
        "method": "user.getrecenttracks",
        "user": currentSettings.username,
        "api_key": Constants.LFM_API_KEY,
        "format": "json",
        "limit": "1",
        "extended": "1"
    }).toString();

    const result = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);
    if (!result.ok) throw new Error(`Failed to fetch the latest scrobble: ${result.statusText}`);

    const info = await result.json();

    const lastTrack = info?.recenttracks?.track?.[0];

    if (!lastTrack) throw info;

    return {
        name: lastTrack.name,
        artist: lastTrack.artist.name,
        album: lastTrack.album["#text"],
        albumArt: await handleAlbumCover(lastTrack.image[3]["#text"]),
        url: lastTrack.url,
        date: lastTrack.date?.["#text"] ?? "now",
        nowPlaying: Boolean(lastTrack["@attr"]?.nowplaying),
        loved: lastTrack.loved === "1",
    } as Track;
}

/** 
 * Currently ditches the default album covers 
 * @param cover The album cover given by Last.fm
*/
async function handleAlbumCover(cover: string): Promise<string> {
    // If the cover is a default one, return null (remove the cover)
    if (Constants.LFM_DEFAULT_COVER_HASHES.some(x => cover.includes(x))) {
        return null;
    }
    return cover;
}

/** Clears the user's activity */
function clearActivity() {
    global.lastActivity && verboseLog("--> Clearing activity...");
    return sendRequest(null);
}

/** Sends the activity details to Discord  */
function sendRequest(activity: Activity) {
    if (global.pluginStopped) {
        console.log("--> Plugin is unloaded, aborting...");
        global.updateInterval && clearInterval(global.updateInterval);
        activity = null;
    }

    global.lastActivity = activity;

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity
    });
}

/** Fetches a Discord application's asset */
async function fetchAsset<T extends string | string[]>(asset: T, appId: string = Constants.APPLICATION_ID): Promise<T> {
    if (!asset) return null;

    if (typeof asset === "string") {
        const assetId = await AssetManager.getAssetIds(appId, [asset]);
        return assetId[0] as T;
    }

    return await AssetManager.getAssetIds(appId, asset);
}

/**
 * Fetches the current scrobble and sets the activity. 
 * This function is actively called by the updateInterval.
 */
async function update() {
    verboseLog("--> Fetching last track...");

    if (!currentSettings.username) {
        showToast("Last.fm username is not set!", getAssetIDByName("Small"));
        flush(); // Flush as we always need reinitialization
        throw new Error("Username is not set");
    }

    const lastTrack = await fetchLatestScrobble().catch(async (err) => {
        verboseLog("--> An error occurred while fetching the last track, aborting...");
        clearActivity();
        throw err;
    });

    if (!lastTrack.nowPlaying) {
        verboseLog("--> Last track is not currently playing, aborting...");
        clearActivity();
        return;
    }

    verboseLog("--> Track fetched!");

    if (global.lastTrackUrl === lastTrack.url) {
        verboseLog("--> Last track is the same as the previous one, aborting...");
        return;
    }

    const activity = {
        name: currentSettings.appName || Constants.DEFAULT_APP_NAME,
        flags: 0,
        type: currentSettings.listeningTo ? 2 : 0,
        details: lastTrack.name,
        state: `by ${lastTrack.artist}`,
        application_id: Constants.APPLICATION_ID,
    } as Activity;

    global.lastTrackUrl = lastTrack.url;

    if (activity.name.includes("{{")) {
        for (const key in lastTrack) {
            activity.name = activity.name.replace(`{{${key}}}`, lastTrack[key]);
        }
    }

    // Set timestamps
    if (currentSettings.showTimestamp) {
        activity.timestamps = {
            start: Date.now() / 1000 | 0
        };
    }

    if (lastTrack.album) {
        activity.assets = {
            large_image: await fetchAsset(lastTrack.albumArt),
            large_text: `on ${lastTrack.album}`
        };
    }

    verboseLog("--> Setting activity...");
    verboseLog(activity);

    try {
        sendRequest(activity);
    } catch (err) {
        verboseLog("--> An error occurred while setting the activity");
        clearActivity();
        throw err;
    }

    verboseLog("--> Successfully set activity!");
}

/** Stops and reset everything, can be started again with `initialize()` */
export function flush() {
    console.log("--> Flushing...");
    global.lastActivity = null;
    global.lastTrackUrl = null;

    global.updateInterval && clearInterval(global.updateInterval);
    clearActivity();
}

/** Initializes the plugin */
export async function initialize() {
    console.log("--> Initializing...");

    if (global.pluginStopped) {
        throw new Error("Plugin is already stopped!");
    }

    flush();

    let tries = 0;

    await update().catch((err) => {
        console.error(err);
        tries++;
    });

    // Periodically fetches the current scrobble and sets the activity
    global.updateInterval = setInterval(
        () => update()
            .then(() => {
                tries = 0;
            })
            .catch(err => {
                console.error(err);

                if (++tries > 3) {
                    console.error("Failed to fetch/set activity 3 times, aborting...");
                    flush();
                }
            }),
        (currentSettings.timeInterval || Constants.DEFAULT_TIME_INTERVAL) * 1000
    );
}
