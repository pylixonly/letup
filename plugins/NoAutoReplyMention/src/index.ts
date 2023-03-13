// export const onUnload = globalThis.vendetta.patcher.before("createPendingReply", globalThis.vendetta.metro.findByProps("createPendingReply"), ([arg]) => arg.shouldMention &&= false);

import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

export interface SettingsSchema {
    exempted: string[];
}

const ReplyManager = findByProps("createPendingReply");

storage.exempted ??= [];

export default new class NoAutoReplyMention {
    settings = Settings;

    onUnload = patcher.before("createPendingReply", ReplyManager, ([arg]) => {
        arg.shouldMention &&= storage.exempted.includes(arg.message?.author?.id);
    });
};
