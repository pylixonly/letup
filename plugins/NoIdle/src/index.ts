import { logger, patcher } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

let unpatch: () => void;

export default {
    onLoad: () => {
        logger.log("Starting NoIdle...");

        unpatch = patcher.before("dispatch", FluxDispatcher, ([{ type }]) => {
            if (type !== "IDLE") return;

            return [{ type: "IDLE", idle: false }];
        });
    },
    onUnload: () => {
        logger.log("Disabling NoIdle..");
        unpatch?.();
    }
}
