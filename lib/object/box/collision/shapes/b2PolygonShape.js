(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2PolygonShape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Shape = require("./b2Shape");
 		//多边形
 		var b2PolygonShape = function() {
 			b2Shape.apply(this, arguments);
 			this.init();
 		};
 		latte_lib.inherit(b2PolygonShape, b2Shape);
 		(function() {
 			this.init = function() {
 				b2Shape.call(this);
 				this.m_type = b2Shape.e_polygonShape;
 				this.m_centroid = new b2Vec2();
 				this.m_vertices = new Array();
 				this.m_normals = new Array();
 			}

 			//预留 
 			this.Reserve = function(count) {
 				if(count === undefined) count = 0;
 				for (var i = parseInt(this.m_vertices.length); i < count; i++) {
			        this.m_vertices[i] = new b2Vec2();
			        this.m_normals[i] = new b2Vec2();
		      	}
 			}

 			this.SetAsBox = function(hx, hy) {
 				if(hx === undefined) hx = 0;
 				if(hy === undefined) hy = 0;
 				this.m_vertexCount = 4;
 				this.Reserve(4);
 				this.m_vertices[0].Set((-hx), (-hy));
				this.m_vertices[1].Set(hx, (-hy));
				this.m_vertices[2].Set(hx, hy);
				this.m_vertices[3].Set((-hx), hy);
				this.m_normals[0].Set(0.0, (-1.0));
				this.m_normals[1].Set(1.0, 0.0);
				this.m_normals[2].Set(0.0, 1.0);
				this.m_normals[3].Set((-1.0), 0.0);
				this.m_centroid.SetZero();
 			}
 		}).call(b2PolygonShape.prototype);
 		module.exports = b2PolygonShape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
