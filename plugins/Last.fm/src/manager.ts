import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { currentSettings, pluginState } from ".";
import { Activity } from "../../defs";
import Constants from "./constants";
import { SelfPresenceStore } from "./modules";
import { clearActivity, fetchAsset, sendRequest } from "./utils/activity";
import { setDebugInfo } from "./utils/debug";
import { fetchLatestScrobble } from "./utils/lastfm";

enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    COMPETING = 5
}

const verboseLog = (...message: any) => currentSettings.verboseLogging && console.log(...message);

/**
 * Fetches the current scrobble and sets the activity. 
 * This function is actively called by the updateInterval.
 */
async function update() {
    if (pluginState.pluginStopped) {
        verboseLog("--> Plugin is unloaded, aborting update()...");
        flush();
        return;
    }

    verboseLog("--> Fetching last track...");

    if (!currentSettings.username) {
        showToast("Last.fm username is not set!", getAssetIDByName("Small"));
        flush(); // Flush as we always need reinitialization
        throw new Error("Username is not set");
    }

    if (currentSettings.ignoreSpotify) {
        const spotifyActivity = SelfPresenceStore.findActivity(act => act.sync_id);
        if (spotifyActivity) {
            verboseLog("--> Spotify is currently playing, aborting...");
            setDebugInfo("isSpotifyIgnored", true);

            clearActivity();
            return;
        } else setDebugInfo("isSpotifyIgnored", false);
    } else {
        setDebugInfo("isSpotifyIgnored", undefined);
    }

    const lastTrack = await fetchLatestScrobble().catch(async (err) => {
        verboseLog("--> An error occurred while fetching the last track, aborting...");
        clearActivity();
        throw err;
    });

    setDebugInfo("lastTrack", lastTrack);

    if (!lastTrack.nowPlaying) {
        verboseLog("--> Last track is not currently playing, aborting...");
        clearActivity();
        return;
    }

    verboseLog("--> Track fetched!");

    if (pluginState.lastTrackUrl === lastTrack.url) {
        verboseLog("--> Last track is the same as the previous one, aborting...");
        return;
    }

    const activity = {
        name: currentSettings.appName || Constants.DEFAULT_APP_NAME,
        flags: 0,
        type: currentSettings.listeningTo ? ActivityType.LISTENING : ActivityType.PLAYING,
        details: lastTrack.name,
        state: `by ${lastTrack.artist}`,
        application_id: Constants.APPLICATION_ID,
    } as Activity;

    pluginState.lastTrackUrl = lastTrack.url;

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
        const asset = await fetchAsset([lastTrack.albumArt]);

        activity.assets = {
            large_image: asset[0],
            large_text: `on ${lastTrack.album}`
        };
    }

    verboseLog("--> Setting activity...");
    setDebugInfo("lastActivity", activity);
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
export function flush(isClearActivity = false) {
    pluginState.lastActivity = null;
    pluginState.lastTrackUrl = null;

    pluginState.updateInterval && clearInterval(pluginState.updateInterval);
    !isClearActivity && clearActivity();
}

/** Initializes the plugin */
export async function initialize() {
    if (pluginState.pluginStopped) {
        throw new Error("Plugin is already stopped!");
    }

    flush();

    let tries = 0;

    await update().catch((err) => {
        console.error(err);
        tries++;
    });

    // Periodically fetches the current scrobble and sets the activity
    pluginState.updateInterval = setInterval(
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
        (Number(currentSettings.timeInterval) || Constants.DEFAULT_TIME_INTERVAL) * 1000
    );
}
