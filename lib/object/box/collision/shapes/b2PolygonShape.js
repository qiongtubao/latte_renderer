(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2PolygonShape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Shape = require("./b2Shape")
 			, b2Vec2 = require("../../common/math/b2Vec2")
 			, Box2D = require("../../index")
 			, b2Mat22 = require("../../common/math/b2Mat22");
 		//多边形
 		var b2PolygonShape = function() {
 			//b2Shape.protoype.init.apply(this, arguments);
 			this.init();
 		};
 		latte_lib.inherits(b2PolygonShape, b2Shape);
 		(function() {
 			this.init = function() {
 				b2Shape.prototype.init.call(this);
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
				debugger;
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
 			this.ComputeMass = function(massData, density) {
 				if(density === undefined) density = 0;
 				if(this.m_vertexCount == 2) {
 					massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
 					massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
 					massData.mass = 0.0;
 					massData.I = 0.0;
 					return ;
 				}
 				var centerX = 0.0;
 				var centerY = 0.0;
 				var area = 0.0;
 				var I = 0.0;
 				var p1X = 0.0;
 				var p1Y = 0.0;
 				var k_inv3 = 1.0/3.0;
 				for(var i = 0; i < this.m_vertexCount; ++i) {
 					var p2 = this.m_vertices[i];
 					var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)]: this.m_vertices[0];
 					var e1X = p2.x - p1X;
 					var e1Y = p2.y - p1Y;
 					var e2X = p3.x - p1X;
 					var e2Y = p3.y - p1Y;
 					var D = e1X * e2Y - e1Y * e2X;
 					var triangleArea = 0.5 * D;
 					area += triangleArea;
 					centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
 					centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
 					var px = p1X;
 					var py = p1Y;
 					var ex1 = e1X;
 					var ey1 = e1Y;
 					var ex2 = e2Y;
 					var ey2 = e2Y;
 					var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
         			var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;I += D * (intx2 + inty2);
 				}
 				massData.mass = density * area;
 				centerX *= 1.0/area;
 				centerY *= 1.0/area;
 				massData.center.Set(centerX, centerY);
 				massData.I = density * I;
 			}
 			/**
 				b2Fixture.CreateProxy ->
 			*/
 			this.ComputeAABB = function(aabb, xf) {
 				var tMat = xf.R;
 				var tVec = this.m_vertices[0];
				var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
				var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
				var upperX = lowerX;
				var upperY = lowerY;
				for (var i = 1; i < this.m_vertexCount; ++i) {
					tVec = this.m_vertices[i];
					var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
					var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
					lowerX = lowerX < vX ? lowerX : vX;
					lowerY = lowerY < vY ? lowerY : vY;
					upperX = upperX > vX ? upperX : vX;
					upperY = upperY > vY ? upperY : vY;
				}
				aabb.lowerBound.x = lowerX - this.m_radius;
				aabb.lowerBound.y = lowerY - this.m_radius;
				aabb.upperBound.x = upperX + this.m_radius;
				aabb.upperBound.y = upperY + this.m_radius;
 			}
 			/**
 				b2World.DrawShape
 			*/
 			this.GetVertexCount = function() {
 				return this.m_vertexCount;
 			}
 			/**
 				b2World.DrawShape
 			*/
 			this.GetVertices = function () {
      			return this.m_vertices;
   			}
 		}).call(b2PolygonShape.prototype);
		(function() {
			this.s_mat = new b2Mat22();
		}).call(b2PolygonShape);
 		module.exports = b2PolygonShape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
