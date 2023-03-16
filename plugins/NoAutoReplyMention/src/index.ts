// export const onUnload = globalThis.vendetta.patcher.before("createPendingReply", globalThis.vendetta.metro.findByProps("createPendingReply"), ([arg]) => arg.shouldMention &&= false);

import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

export interface SettingsSchema {
    isBlacklistMode: boolean;
    exempted: string[];
}

export const settings = storage as SettingsSchema;

const ReplyManager = findByProps("createPendingReply");

settings.isBlacklistMode ??= false;
settings.exempted ??= [];

export default new class NoAutoReplyMention {
    settings = Settings;

    onUnload = patcher.before("createPendingReply", ReplyManager, ([arg]) => {
        const isListed = settings.exempted.includes(arg.message?.author?.id);
        arg.shouldMention &&= settings.isBlacklistMode ? !isListed : isListed;
    });
};
