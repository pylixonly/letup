!function(t,n,o){"use strict";let e;let i=o.findByDisplayName("ChatInput"),a=function(){function t(){!function(t,n){if(!(t instanceof n))throw TypeError("Cannot call a class as a function")}(this,t)}var o=t.prototype;return o.onLoad=function(){n.logger.log("Starting HideGiftButton..."),e=i.defaultProps.hideGiftButton,i.defaultProps.hideGiftButton=!0},o.onUnload=function(){n.logger.log("Unloading HideGiftButton.."),i.defaultProps.hideGiftButton=e},t}();t.default=a,Object.defineProperty(t,"__esModule",{value:!0})}({},vendetta,vendetta.metro);