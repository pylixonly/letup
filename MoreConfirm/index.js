!function(t,o,e){"use strict";/*!
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
*/let n=e.findByProps("show","confirm","close"),r=e.findByProps("handleStartCall"),a=function(){function t(){!function(t,o){if(!(t instanceof o))throw TypeError("Cannot call a class as a function")}(this,t)}return t.prototype.onLoad=function(){o.logger.log("MoreConfirm: patching calls..."),o.patcher.instead("handleStartCall",r,function(t,e){let[{rawRecipients:[{username:r,discriminator:a},l]},c]=t,i=c?"video call":"call";n.show({title:l?`MoreConfirm: Start a group ${i}?`:`MoreConfirm: Start a ${i} with ${r}#${a}?`,body:l?"Are you sure you want to start the group call?":`Are you sure you want to ${i} ${r}#${a}?`,confirmText:"Yes",cancelText:"Cancel",confirmColor:"brand",onConfirm:function(){try{e(...t)}catch(t){o.logger.error("Failed to start call",t)}}})})},t}();t.default=a,Object.defineProperty(t,"__esModule",{value:!0})}({},vendetta,vendetta.metro);