(function(exports,_vendetta,common){'use strict';function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}let unpatch;var index = new(function(){function NoIdle(){_classCallCheck(this,NoIdle);}var _proto=NoIdle.prototype;_proto.onLoad=function onLoad(){_vendetta.logger.log("Starting NoIdle...");unpatch=_vendetta.patcher.before("dispatch",common.FluxDispatcher,function(param){let[{type}]=param;if(type!=="IDLE")return;return [{type:"IDLE",idle:false}]});};_proto.onUnload=function onUnload(){_vendetta.logger.log("Disabling NoIdle..");unpatch?.();};return NoIdle}());exports.default=index;Object.defineProperty(exports,'__esModule',{value:true});return exports;})({},vendetta,vendetta.metro.common);