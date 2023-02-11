import { logger } from "@vendetta";
import { findByDisplayName } from "@vendetta/metro";

let origState: Boolean;
const ChatInput = findByDisplayName("ChatInput");

export default {
    onLoad: () => {
        logger.log("Starting HideGiftButton...");
        origState = ChatInput.defaultProps.hideGiftButton;
        ChatInput.defaultProps.hideGiftButton = true;
    },
    onUnload: () => {
        logger.log("Unloading HideGiftButton..");
        ChatInput.defaultProps.hideGiftButton = origState;
    }
}
