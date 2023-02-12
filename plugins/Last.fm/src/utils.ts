import { patcher } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { currentSettings, global, SET_ACTIVITY, verboseLog } from ".";
import Constants from "./constants";

/** Fetches the latest user's scrobble */
async function fetchLatestScrobble(): Promise<Track> {
    const params = new URLSearchParams({
        'method': 'user.getrecenttracks',
        'user': currentSettings.username,
        'api_key': Constants.LFM_API_KEY,
        'format': 'json',
        'limit': '1',
        'extended': '1'
    }).toString();

    const info = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`).then(x => x.json());
    const lastTrack = info.recenttracks?.track?.[0] || Promise.reject(info);
    return {
        name: lastTrack.name,
        artist: lastTrack.artist.name,
        album: lastTrack.album['#text'],
        albumArt: handleAlbumCover(lastTrack.image[3]['#text']),
        url: lastTrack.url,
        date: lastTrack.date?.['#text'] ?? 'now',
        nowPlaying: Boolean(lastTrack['@attr']?.nowplaying),
        loved: lastTrack.loved === '1',
    } as Track;
}

/** Currently ditches the default album covers 
 * @param cover The album cover given by Last.fm
*/
function handleAlbumCover(cover: string): string {
    // If the cover is a default one, return null (empty)
    if (Constants.DEFAULT_COVER_HASHES.some(x => cover.includes(x))) {
        return null;
    }
    return cover;
}

/** Sends the activity details to Discord  */
async function sendRequest(activity: Activity): Promise<ResultActivity> {
    if (global.stopped) {
        console.log("--> Plugin is unloaded, aborting...");
        global.updateInterval && clearInterval(global.updateInterval);
        activity = null;
    }

    global.lastActivity = activity;

    return await SET_ACTIVITY.handler({
        isSocketConnected: () => true,
        socket: {
            id: 120,
            application: {
                id: Constants.APPLICATION_ID,
                name: activity?.name || "RichPresence"
            },
            transport: "ipc"
        },
        args: {
            pid: 120,
            activity: activity && { ...activity } || null
        }
    });
}

/** Clears the user's activity */
function clearActivity(): Promise<ResultActivity> {
    global.lastActivity && verboseLog("--> Clearing activity...");
    return sendRequest(null);
}

/**
 * Fetches the current scrobble and sets the activity. 
 * This function is actively called by the updateInterval.
 */
export async function update() {
    verboseLog("--> Fetching last track...");

    if (!currentSettings.username) {
        showToast("Last.fm username is not set!", getAssetIDByName("Small"));
        await flush(); // Flush as we always need reinitialization
        throw new Error("Username is not set");
    }

    const lastTrack = await fetchLatestScrobble().catch(async function (err) {
        verboseLog("--> An error occurred while fetching the last track, aborting...");
        await clearActivity().catch();
        throw err;
    });

    if (!lastTrack.nowPlaying) {
        verboseLog("--> Last track is not currently playing, aborting...");
        return await clearActivity();
    }

    verboseLog("--> Setting activity...");

    if (global.lastTrackUrl === lastTrack.url) {
        verboseLog("--> Last track is the same as the previous one, aborting...");
        return;
    }

    const activity = {
        name: currentSettings.appName || Constants.DEFAULT_APP_NAME,
        type: currentSettings.listeningTo ? 2 : 0,
        details: lastTrack.name,
        state: `by ${lastTrack.artist}`,
    } as Activity;

    global.lastTrackUrl = lastTrack.url;

    // Set timestamps
    if (currentSettings.showTimestamp) {
        activity.timestamps = {
            start: Date.now() / 1000 | 0
        };
    }

    if (lastTrack.albumArt) {
        activity.assets = {
            large_image: lastTrack.albumArt,
            large_text: `on ${lastTrack.album}`,
        }
    }

    const response = await sendRequest(activity).catch(async function (err) {
        verboseLog("--> An error occurred while setting the activity");
        await clearActivity().catch();
        throw err;
    });

    verboseLog("--> Successfully set activity!");
    verboseLog(response);
    return response;
}

/** Stops everything */
export function flush(): Promise<ResultActivity> {
    console.log("--> Flushing...");
    global.lastActivity = null;
    global.updateInterval && clearInterval(global.updateInterval);

    return clearActivity();
}

/** Initializes the plugin */
export async function initialize() {
    console.log("--> Initializing...");

    if (global.stopped) {
        throw new Error("Plugin is already stopped!");
    }

    global.lastTrackUrl = null;

    global.updateInterval && clearInterval(global.updateInterval);
    global.lastActivity && await clearActivity();

    let tries = 0;

    update().catch((err) => {
        console.error(err);
        tries++;
    });

    // Periodically fetches the current scrobble and sets the activity
    global.updateInterval = setInterval(
        () => update()
            .then(() => tries = 0)
            .catch(err => {
                console.error(err);

                if (++tries > 3) {
                    console.error("Failed to fetch/set activity 3 times, aborting...");
                    clearInterval(global.updateInterval);
                    global.stopped = true;
                }
            }),
        currentSettings.timeInterval
    );
}

// Discord doesn't allow us to set the activity type to "Listening to" so we have to patch it
export function patchActivityType(): () => boolean {
    if (global.activityTypeUnpatch) {
        console.warn("This is weird... activity type override is already defined?");
        global.activityTypeUnpatch();
    }

    console.log("Patching activity type...");

    const nodes = Object.values(FluxDispatcher._actionHandlers._dependencyGraph.nodes);
    const { actionHandler } = nodes.find((x: any) => x.name === "LocalActivityStore") as any;

    return patcher.before("LOCAL_ACTIVITY_UPDATE", actionHandler, ([{ activity }]) => {
        if (activity && activity.name === global.lastActivity.name) {
            activity.type = global.lastActivity.type;
        }
    });
}
