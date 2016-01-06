(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactImpulse", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2ContactImpulse = function() {
   			this.normalImpulses = box2D.NVector(b2Settings.b2_maxManifoldPoints);
   			this.tangentImpulses = box2D.NVector(b2Settings.b2_maxManifoldPoints);
	   	};
	   	(function() {
	   		
	   	}).call(b2ContactImpulse.prototype);
	   	(function() {
	   		
	   	}).call(b2ContactImpulse);
	   	module.exports = b2ContactImpulse;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );