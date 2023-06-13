import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const messageInputUtil = findByProps("selectGIF");

export const unLoad = instead("selectGIF", messageInputUtil, ([{ url }]) => messageInputUtil.insertText(url));
