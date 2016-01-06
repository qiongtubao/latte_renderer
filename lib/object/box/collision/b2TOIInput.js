(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2TOIInput", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2DistanceProxy = require("./b2DistanceProxy")
   			, b2Sweep = require("../common/math/b2Sweep")
   		var b2TOIInput = function() {
   			this.proxyA = new b2DistanceProxy();
   			this.proxyB = new b2DistanceProxy();
   			this.sweepA = new b2Sweep();
   			this.sweepB = new b2Sweep();
   		};
   		(function() {
   			
   		}).call(b2TOIInput.prototype);
   		module.exports = b2TOIInput;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );