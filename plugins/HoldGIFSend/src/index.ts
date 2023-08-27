import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const messageInputUtil = findByProps("selectGIF");

export const onUnload = instead("selectGIF", messageInputUtil, (args) => {
    // args[1] never exists on older version, so we use it as an indicator
    // prev: selectGIF([GIF]) now: selectGIF(currentChannelId, [GIF]);
    if (args[1]) args[1] = args[1].url;
    else args[0] = args[0].url;

    messageInputUtil.insertText(...args);
});
