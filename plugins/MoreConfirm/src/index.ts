/*!
 * https://github.com/amsyarasyiq/aliucordrn-plugins/blob/6c0be39ca673c6ebcf48c0f397246b76d578aa26/MoarConfirm/index.tsx
 *
 * Copyright (c) 2022 Amsyar Rasyiq
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { logger, patcher } from "@vendetta";
import { findByProps } from "@vendetta/metro";

const dialog = findByProps("show", "confirm", "close");
const CallManager = findByProps("handleStartCall");

export default {
    onLoad: () => {
        // Patch voice/video calls
        logger.log("MoreConfirm: patching calls...");

        patcher.instead("handleStartCall", CallManager, (args, orig) => {
            const [{ rawRecipients: [{ username, discriminator }, multiple] }, isVideo] = args;
            const action = isVideo ? "video call" : "call";

            // if `multiple` is defined, it's probably a group call
            dialog.show({
                title: multiple ? `MoreConfirm: Start a group ${action}?` : `MoreConfirm: Start a ${action} with ${username}#${discriminator}?`,
                body: multiple ? "Are you sure you want to start the group call?" : `Are you sure you want to ${action} ${username}#${discriminator}?`,
                confirmText: "Yes",
                cancelText: "Cancel",
                confirmColor: "brand",
                onConfirm: () => {
                    try {
                        orig(...args);
                    } catch (e) {
                        logger.error("Failed to start call", e);
                    }
                },
            });
        });
    }
};
