export const onUnload = globalThis.vendetta.patcher.before("createPendingReply", globalThis.vendetta.metro.findByProps("createPendingReply"), ([arg]) => arg.shouldMention &&= false);
