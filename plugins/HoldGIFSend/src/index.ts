import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const messageInputUtil = findByProps("selectGIF");

export const onUnload = instead("selectGIF", messageInputUtil, ([{ url }]) => messageInputUtil.insertText(url));
