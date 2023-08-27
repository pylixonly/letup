// export const onUnload = globalThis.vendetta.patcher.before("createPendingReply", globalThis.vendetta.metro.findByProps("createPendingReply"), ([arg]) => arg.shouldMention &&= false);

import { patcher } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

export interface SettingsSchema {
    isBlacklistMode: boolean;
    exempted: string[];
}

storage.isBlacklistMode ??= false;
storage.exempted ??= [];

export const settings = storage as SettingsSchema;

const ReplyManager = findByProps("createPendingReply");

export default {
    settings: Settings,
    onUnload: patcher.before("createPendingReply", ReplyManager, ([arg]) => {
        const isListed = storage.exempted.includes(arg.message?.author?.id);
        arg.shouldMention &&= storage.isBlacklistMode ? !isListed : isListed;
    })
};
