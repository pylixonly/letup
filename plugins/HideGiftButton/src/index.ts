import { logger } from "@vendetta";
import { find } from "@vendetta/metro";

const ChatInput = find((m) => typeof m?.defaultProps?.hideGiftButton === "boolean");

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
