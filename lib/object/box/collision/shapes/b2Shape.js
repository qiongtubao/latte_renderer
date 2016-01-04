(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2Shape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//
 		var b2Shape = function() {
 			
 		};
 		(function() {
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
 		}).call(b2Shape);
 		module.exports = b2Shape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
