import { logger } from "@vendetta";
import { findByName } from "@vendetta/metro";

const ChatInput = findByName("ChatInput");

export default new class HideGiftButton {
    origState: boolean;
    onLoad() {
        logger.log("Starting HideGiftButton...");
        this.origState = ChatInput.defaultProps.hideGiftButton;
        ChatInput.defaultProps.hideGiftButton = true;
    }
    onUnload() {
        logger.log("Unloading HideGiftButton..");
        ChatInput.defaultProps.hideGiftButton = this.origState;
    }
};
