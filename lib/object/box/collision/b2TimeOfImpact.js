(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2TimeOfImpact", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2SimplexCache = require("./b2SimplexCache")
   			, b2DistanceInput = require("./b2DistanceInput")
   			, b2Transform = require("../common/math/b2Transform")
   			, b2SeparationFunction = require("./b2SeparationFunction")
   			, b2DistanceOutput = require("./b2DistanceOutput");
   		var b2TimeOfImpact = function() {

   		};
   		(function() {
   			
   		}).call(b2TimeOfImpact.prototype);
   		(function() {
   			this.b2_toiCalls = 0;
   			this.b2_toiIters = 0;
   			this.b2_toiMaxIters = 0;
   			this.b2_toiMaxRootIters = 0;
   			this.s_cache = new b2SimplexCache();
   			this.s_distanceInput = new b2DistanceInput();
   			this.s_xfA = new b2Transform();
   			this.s_xfB = new b2Transform();
   			this.s_fcn = new b2SeparationFunction();
   			this.s_distanceOutput = new b2DistanceOutput();
   		}).call(b2TimeOfImpact);
   		module.exports = b2TimeOfImpact;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );