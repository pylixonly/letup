import { patcher } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

export const onUnload = patcher.before("dispatch", FluxDispatcher, ([{ type }]) => {
    if (type !== "IDLE") return;

    return [{ type: "IDLE", idle: false }];
});
