import { findByName } from "@vendetta/metro";
import { i18n } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { findInReactTree } from "@vendetta/utils";

import ListenAlongButton from "./components/ListenAlongButton";

let sectionPatch: () => void;

export default {
    onLoad() {
        const getListeningHeader = () => i18n.Messages.USER_ACTIVITY_HEADER_LISTENING?.intlMessage?.format({ name: "Spotify" });

        sectionPatch = before("default", findByName("UserProfileSection", false), ([props]) => {
            if (props.title !== getListeningHeader()) return;

            const spotifyElement = findInReactTree(props.children, e => e?.style?.padding === 0);
            const actionsIndex = spotifyElement?.children?.findIndex?.(e => e?.type?.name === "Actions");

            if (actionsIndex && actionsIndex !== -1) {
                const actions = spotifyElement.children[actionsIndex];

                spotifyElement.children[actionsIndex] = <>
                    {actions}
                    {<ListenAlongButton {...actions.props} />}
                </>;
            }
        });
    },
    onUnload() {
        sectionPatch?.();
    }
};
