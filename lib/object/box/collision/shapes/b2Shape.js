(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2Shape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2DistanceInput = require("../b2DistanceInput")
 			, b2Distance = require("../b2Distance")
 			, b2DistanceProxy = require("../b2DistanceProxy")
 			, b2DistanceOutput = require("../b2DistanceOutput")
 			, b2Settings = require("../../common/b2Settings");
 		var b2Shape = function() {
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.m_type = b2Shape.e_unknownShape;
 				this.m_radius = b2Settings.b2_linearSlop;
 			}
 			this.Set = function(other) {
 				this.m_radius = other.m_radius;
 			}
 			this.GetType = function() {
 				return this.m_type;
 			}
 			
 		}).call(b2Shape.prototype);
 		(function() {
 			this.e_unknownShape = parseInt((-1));
		      this.e_circleShape = 0;
		      this.e_polygonShape = 1;
		      this.e_edgeShape = 2;
		      this.e_shapeTypeCount = 3;
		      this.e_hitCollide = 1;
		      this.e_missCollide = 0;
		      this.e_startsInsideCollide = parseInt((-1));

		      this.TestOverlap = function(shape1, transform1, shape2, transform2) {
		      	debugger;
		      	 var input = new b2DistanceInput();
		      	 input.proxyA = new b2DistanceProxy();
		      	 input.proxyA.Set(shape1);
		      	 input.proxyB = new b2DistanceProxy();
		      	 input.proxyB.Set(shape2);
		      	 input.transformA = transform1;
		      	 input.transformB = transform2;
		      	 input.useRadii = true;
		      	 var simplexCache = new b2SimplexCache();
		      	 var output = new b2DistanceOutput();
		      	 b2Distance.Distance(output, simplexCache, input);
		      	 return output.distance < 10.0 * Number.MIN
		      }
 		}).call(b2Shape);
 		module.exports = b2Shape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
