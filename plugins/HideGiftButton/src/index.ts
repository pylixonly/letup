import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findInReactTree } from "@vendetta/utils";

const ChatInput = findByName("ChatInput");

let unpatch: () => boolean;

export default {
    onLoad() {
        const blockList = ["ic_thread_normal_24px", "ic_gift"].map(n => getAssetIDByName(n));
        const blockTypeList = [6];
        unpatch = after("render", ChatInput.prototype, (_, ret) => {
            const input = findInReactTree(ret, t => "forceAnimateButtons" in t.props && t.props.actions);
            input.props.actions = input.props.actions.filter(a =>
                !blockList.includes(a.source) && !blockTypeList.includes(a.type));
        });
    },
    onUnload: unpatch
};
