import { logger, patcher, plugin } from "@vendetta";
import { findByProps, findByStoreName } from '@vendetta/metro';
import { FluxDispatcher } from '@vendetta/metro/common';
import Settings from "./settings";

let stopped: Boolean,
    lastActivity: Activity,
    updateInterval: NodeJS.Timer,
    lastTrackUrl: string,
    activityTypeUnpatch: () => void;

const settings = plugin.storage as {
    appName: string;
    username: string;
    showTimestamp: string;
    timeInterval: number;
    listeningTo: boolean;
    verboseLogging: boolean;
};

// Constants for the API calls (perhaps these should be options?)
const APPLICATION_ID = "1054951789318909972";
const LFM_API_KEY = "615322f0047e12aedbc610d9d71f7430";

// These are the default album covers that are used by Last.fm
const DEFAULT_COVER_HASHES = [
    "2a96cbd8b46e442fc41c2b86b821562f",
    "c6f59c1e5e7240a4c0d427abd71f3dbb",
];

// Discord activity
type Activity = {
    name: string;
    type: number;
    details: string;
    state: string;
    timestamps?: {
        start: number;
        end?: number;
    };
    assets?: ActivityAssets;
}

type ResultActivity = {
    name: string;
    type: number;
    details: string;
    state: string;
    timestamps?: {
        start: number;
        end?: number;
    };
    assets?: ActivityAssets;
    application_id: string;
};

type ActivityAssets = {
    large_image: string;
    large_text?: string;
} | {
    small_image: string;
    small_text?: string;
};

type Track = {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    date: string;
    nowPlaying: boolean;
    loved: boolean;
}

// Discord modules that we need
const UserStore = findByStoreName("UserStore")
const SET_ACTIVITY = findByProps('SET_ACTIVITY').SET_ACTIVITY;

const verboseLog = (...message: any) => settings.verboseLogging && logger.log(...message);

async function fetchCurrentScrobble(): Promise<Track> {
    const params = new URLSearchParams({
        'method': 'user.getrecenttracks',
        'user': settings.username,
        'api_key': LFM_API_KEY,
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
        albumArt: filterAlbumCover(lastTrack.image[3]['#text']),
        url: lastTrack.url,
        date: lastTrack.date?.['#text'] ?? 'now',
        nowPlaying: Boolean(lastTrack['@attr']?.nowplaying),
        loved: lastTrack.loved === '1',
    } as Track;
}

// Currently ditches the default album covers (they're ugly)
// Might as well use Youtube as fallback too (soontm)
function filterAlbumCover(cover: string): string {
    if (DEFAULT_COVER_HASHES.some(x => cover.includes(x))) {
        return null;
    }
    return cover;
}

// Clears the activity
function clearActivity(): Promise<ResultActivity> {
    lastActivity && verboseLog("--> Clearing activity...");
    return sendRequest(null);
}

// Sends the activity details to Discord
async function sendRequest(activity: Activity): Promise<ResultActivity> {
    if (stopped) {
        console.log("--> Plugin is unloaded, aborting...");
        updateInterval && clearInterval(updateInterval);
        activity = null;
    }

    lastActivity = activity;

    return await SET_ACTIVITY.handler({
        isSocketConnected: () => true,
        socket: {
            id: 120,
            application: {
                id: APPLICATION_ID,
                name: activity?.name || "RichPresence"
            },
            transport: "ipc"
        },
        args: {
            pid: 120,
            activity: activity && { ...activity }
        }
    });
}

// Fetches the current scrobble and sets the activity
// This is the main function that is called every 5 seconds (or whatever the user has set)
async function update() {
    verboseLog("--> Fetching last track...");
    const lastTrack = await fetchCurrentScrobble().catch((err) => {
        verboseLog("--> An error occurred while fetching the last track, aborting...");
        throw err;
    });

    if (!lastTrack.nowPlaying) {
        verboseLog("--> Last track is not currently playing, aborting...");
        return await clearActivity();
    }

    verboseLog("--> Setting activity...");

    if (lastTrackUrl === lastTrack.url) {
        verboseLog("--> Last track is the same as the previous one, aborting...");
        return;
    }

    const activity = {
        name: settings.appName || "Music",
        type: settings.listeningTo ? 2 : 0,
        details: lastTrack.name,
        state: `by ${lastTrack.artist}`,
    } as Activity;

    lastTrackUrl = lastTrack.url;

    if (settings.showTimestamp) {
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

    const response = await sendRequest(activity).catch((err) => {
        verboseLog("--> An error occurred while setting the activity");
        throw err;
    });

    verboseLog("--> Successfully set activity!");
    verboseLog(response);
    return response;
}

// Initializes the plugin
async function initialize() {
    console.log("--> Initializing...");

    stopped = false;
    lastActivity = null;
    lastTrackUrl = null;

    if (updateInterval) clearInterval(updateInterval);
    if (lastActivity) await clearActivity();

    update().catch(console.error);

    let tries = 0;

    // Periodically fetches the current scrobble and sets the activity
    updateInterval = setInterval(
        () => update()
            .then(() => tries = 0)
            .catch(err => {
                console.error(err);

                if (++tries > 3) {
                    console.error("Failed to fetch/set activity 3 times, aborting...");
                    clearInterval(updateInterval);
                }
            }),
        settings.timeInterval
    );
}

// Discord doesn't allow us to set the activity type to "Listening to" so we have to patch it
function patchActivityType() {
    if (activityTypeUnpatch) {
        console.warn("This is weird... activityTypeUnpatch is already defined?");
        activityTypeUnpatch();
    } else {
        console.log("Patching activity type...");
    }

    const nodes = Object.values(FluxDispatcher._actionHandlers._dependencyGraph.nodes);
    const { actionHandler } = nodes.find((x: any) => x.name === "LocalActivityStore") as any;

    activityTypeUnpatch = patcher.before("LOCAL_ACTIVITY_UPDATE", actionHandler, ([{ activity }]) => {
        if (activity.name === lastActivity.name) {
            activity.type = lastActivity.type;
        }
    });
}

// Plugin entry point
export default {
    onLoad: () => {
        console.log("Starting last.fm plugin..");
        patchActivityType();

        // Options
        // settings.appName = "Music";
        // settings.username = "slyde99";
        // settings.showTimestamp = true;
        // settings.timeInterval = 5000;
        // settings.listeningTo = true;
        // settings.verboseLogging = false;

        // If the user is already logged in (brrr connection), initialize the plugin
        if (UserStore.getCurrentUser()) {
            console.log("User is already logged in, initializing...");
            initialize().catch(console.error);
        }

        // Just in case the user logs in before the plugin is loaded
        FluxDispatcher.subscribe("CONNECTION_OPEN", () => {
            initialize().catch(console.error)
        });
    },
    onUnload: () => {
        console.log("Stopping last.fm...");

        stopped = true;
        lastActivity = null;
        updateInterval && clearInterval(updateInterval);

        clearActivity();
        activityTypeUnpatch?.();
        activityTypeUnpatch = null;
    },
    settings: Settings
}
