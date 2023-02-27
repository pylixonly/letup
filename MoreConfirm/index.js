(function(exports,_vendetta,metro){'use strict';/*!
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
*/function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}const dialog=metro.findByProps("show","confirm","close");const CallManager=metro.findByProps("handleStartCall");var index = new(function(){function MoreConfirm(){_classCallCheck(this,MoreConfirm);}var _proto=MoreConfirm.prototype;_proto.onLoad=function onLoad(){_vendetta.logger.log("MoreConfirm: patching calls...");_vendetta.patcher.instead("handleStartCall",CallManager,function(args,orig){const[{rawRecipients:[{username,discriminator},multiple]},isVideo]=args;const action=isVideo?"video call":"call";dialog.show({title:multiple?`MoreConfirm: Start a group ${action}?`:`MoreConfirm: Start a ${action} with ${username}#${discriminator}?`,body:multiple?"Are you sure you want to start the group call?":`Are you sure you want to ${action} ${username}#${discriminator}?`,confirmText:"Yes",cancelText:"Cancel",confirmColor:"brand",onConfirm:function(){try{orig(...args);}catch(e){_vendetta.logger.error("Failed to start call",e);}}});});};return MoreConfirm}());exports.default=index;Object.defineProperty(exports,'__esModule',{value:true});return exports;})({},vendetta,vendetta.metro);