(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2PolygonShape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Shape = require("./b2Shape")
 			, b2Vec2 = require("../../common/math/b2Vec2")
 			, Box2D = require("../../index");
 		//多边形
 		var b2PolygonShape = function() {
 			b2Shape.apply(this, arguments);
 			this.init();
 		};
 		latte_lib.inherits(b2PolygonShape, b2Shape);
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
 			this.Copy = function() {
 				var s = new b2PolygonShape();
 				s.Set(this);
 				return s;
 			}
 			this.Set = function(other) {
 				b2Shape.prototype.Set.call(this, other);
 				if(Box2D.is(other, b2PolygonShape)) {
 					//var other2 = (other instanceof b2PolygonShape)? other : null;
 					this.m_centroid.SetV(other2.m_centroid);
 					this.m_vertexCount = other2.m_vertexCount;
 					this.Reserve(this.m_vertexCount);
 					for(var i = 0; i < this.m_vertexCount; i++) {
 						this.m_vertices[i].SetV(other2.m_vertices[i]);
 						this.m_normals[i].SetV(other2.m_normals[i]);
 					}
 				}
 			}
 		}).call(b2PolygonShape.prototype);
 		module.exports = b2PolygonShape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
