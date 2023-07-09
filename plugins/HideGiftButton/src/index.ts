import { findByName } from "@vendetta/metro";

const ChatInput = findByName("ChatInput");

// Object.defineProperty(ChatInput.defaultProps, "hideGiftButton", {
//     get: () => plugins?.[plugin.id]?.enabled
// });

export default {
    onLoad() {
        ChatInput.defaultProps.hideGiftButton = true;
    },
    onUnload() {
        ChatInput.defaultProps.hideGiftButton = false;
    }
};
