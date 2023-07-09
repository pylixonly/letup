import { plugin } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

import { Activity, LFMSettings } from "../../defs";
import { flush, initialize } from "./manager";
import { UserStore } from "./modules";
import Settings from "./pages/Settings";

export const pluginState = {} as {
    pluginStopped?: boolean,
    lastActivity?: Activity,
    updateInterval?: NodeJS.Timer,
    lastTrackUrl?: string,
};

plugin.storage.ignoreSpotify ??= true;
export const currentSettings = { ...plugin.storage } as LFMSettings;

export const verboseLog = (...message: any) => currentSettings.verboseLogging && console.log(...message);

// Plugin entry point
export default new class LastFM {
    onLoad() {
        console.log("Starting last.fm plugin..");
        pluginState.pluginStopped = false;

        if (UserStore.getCurrentUser()) {
            console.log("User is already logged in, initializing...");
            initialize().catch(console.error);
        }

        FluxDispatcher.subscribe("CONNECTION_OPEN", () => {
            initialize().catch(console.error);
        });
    }

    onUnload() {
        console.log("Stopping last.fm...");
        pluginState.pluginStopped = true;

        flush();
    }

    settings = Settings;
};
