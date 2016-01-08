(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2EdgeShape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//
 		var latte_lib = require("latte_lib")
 			,  Shape = require("./b2Shape");
 		function EdgeShape(v1, v2) {
 			//Shape.apply(this, arguments);
 			this.s_supportVec = new b2Vec2();
 			this.m_v1 = new b2Vec2();
 			this.m_v2 = new b2Vec2();
 			this.m_coreV1 = new b2Vec2();
 			this.m_coreV2 = new b2Vec2();
 			this.m_normal = new b2Vec2();
 			this.m_direction = new b2Vec2();
 			this.m_cornerDir1 = new b2Vec2();
 			this.m_cornerDir2 = new b2Vec2();
 			this.init(v1, v2);
 		};
 		latte_lib.inherits(EdgeShape, Shape);
 		(function() {
 			this.init = function(v1, v2) {
 				Shape.call(this);
 				this.m_type = b2Shape.e_edgeShape;
 				this.m_prevEdge = null;
 				this.m_nextEdge = null;
 				this.m_v1 = v1;
 				this.m_v2 = v2;
 				this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
 				this.m_length = this.m_direction.Normalize();
 				this.m_normal.Set(this.m_direction.y, (-this.m_direction.x));
 				this.m_coreV1.Set((-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x)) + this.m_v1.x, (-b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y)) + this.m_v1.y);;
 				this.m_coreV2.Set((-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x)) + this.m_v2.x, (-b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y)) + this.m_v2.y);
 				this.m_cornerDir1 = this.m_normal;
      			this.m_cornerDir2.Set((-this.m_normal.x), (-this.m_normal.y));
 			}
 			
 		}).call(EdgeShape.prototype);
 		
 		module.exports = EdgeShape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
