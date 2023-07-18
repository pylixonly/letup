import { plugin } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

import { Activity, LFMSettings } from "../../defs";
import { flush, initialize } from "./manager";
import { UserStore } from "./modules";
import Settings from "./ui/pages/Settings";

export const pluginState = {} as {
    pluginStopped?: boolean,
    lastActivity?: Activity,
    updateInterval?: NodeJS.Timer,
    lastTrackUrl?: string,
};

plugin.storage.ignoreSpotify ??= true;
export const currentSettings = { ...plugin.storage } as LFMSettings;

export default {
    settings: Settings,
    onLoad() {
        pluginState.pluginStopped = false;

        if (UserStore.getCurrentUser()) {
            initialize().catch(console.error);
        } else {
            const callback = () => {
                initialize().catch(console.error);
                FluxDispatcher.unsubscribe(callback);
            };

            FluxDispatcher.subscribe("CONNECTION_OPEN", callback);
        }

    },
    onUnload() {
        pluginState.pluginStopped = true;
        flush();
    }
};
