(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Collision", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var box2D = require("../index")
 			, b2Vect2 = require("../common/math/b2Vec2")
 			, ClipVertex = require("./clipVertex")
 			, b2Manifold = require("./b2Manifold");
 		var b2Collision = function() {

 		};
 		(function() {

 		}).call(b2Collision.prototype);
 		(function() {
 			this.MakeClipPointVector = function () {
				var r = new Array(2);
				r[0] = new ClipVertex();
				r[1] = new ClipVertex();
				return r;
		   	}

		   	/**
		   		矩形和圆接触
		   		@method CollidePolygonAndCircle
		   		@param manifold {b2Manifold}
		   		@param polygon {b2PolygonShape}
		   		@param xf1 {b2Transform}
		   		@param circle {b2CircleShape}
		   		@param xf2 {b2Transform}
		   	*/
		   	this.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
		   		manifold.m_pointCount = 0;
		   		var tPoint
		   			, dX = 0
		   			, dY = 0
		   			, positionX = 0
		   			, positionY = 0
		   			, tVec 
		   			, tMat ;
		   		tMat = xf2.R;
		   		tVec = circle.m_p;
		   		var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
		   		var cY = xf2.position.x + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
		   		dX = cX - xf1.position.x;
		      	dY = cY - xf1.position.y;
		      	tMat = xf1.R;
		      	var cLocalX = (dX * tMat.col1.x + dY * tMat.col1.y);
		      	var cLocalY = (dX * tMat.col2.x + dY * tMat.col2.y);
		      	var dist = 0;
		      	var normalIndex = 0;
		      	var separation = (-Number.MAX_VALUE);
		      	var radius = polygon.m_radius + circle.m_radius;
		      	var vertexCount = parseInt(polygon.m_vertexCount);
		      	var vertices = polygon.m_vertices;
		      	var normals = polygon.m_normals;
				for (var i = 0; i < vertexCount; ++i) {
					tVec = vertices[i];
					dX = cLocalX - tVec.x;
					dY = cLocalY - tVec.y;
					tVec = normals[i];
					var s = tVec.x * dX + tVec.y * dY;
					if (s > radius) {
						return;
					}
					if (s > separation) {
						separation = s;
						normalIndex = i;
					}
				}
				var vertIndex1 = parseInt(normalIndex);
				var vertIndex2 = parseInt(vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0);
				var v1 = vertices[vertIndex1];
				var v2 = vertices[vertIndex2];
				if (separation < Number.MIN_VALUE) {
					manifold.m_pointCount = 1;
					manifold.m_type = b2Manifold.e_faceA;
					manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
					manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
					manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
					manifold.m_points[0].m_localPoint.SetV(circle.m_p);
					manifold.m_points[0].m_id.key = 0;
					return;
				}
				var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
				var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
				if (u1 <= 0.0) {
					if ((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) return;
					manifold.m_pointCount = 1;
					manifold.m_type = b2Manifold.e_faceA;
					manifold.m_localPlaneNormal.x = cLocalX - v1.x;
					manifold.m_localPlaneNormal.y = cLocalY - v1.y;
					manifold.m_localPlaneNormal.Normalize();
					manifold.m_localPoint.SetV(v1);
					manifold.m_points[0].m_localPoint.SetV(circle.m_p);
					manifold.m_points[0].m_id.key = 0;
				}else if (u2 <= 0) {
					if ((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) return;
					manifold.m_pointCount = 1;
					manifold.m_type = b2Manifold.e_faceA;
					manifold.m_localPlaneNormal.x = cLocalX - v2.x;
					manifold.m_localPlaneNormal.y = cLocalY - v2.y;
					manifold.m_localPlaneNormal.Normalize();
					manifold.m_localPoint.SetV(v2);
					manifold.m_points[0].m_localPoint.SetV(circle.m_p);
					manifold.m_points[0].m_id.key = 0;
		      	}else {
					var faceCenterX = 0.5 * (v1.x + v2.x);
					var faceCenterY = 0.5 * (v1.y + v2.y);
					separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
					if (separation > radius) return;
					manifold.m_pointCount = 1;
					manifold.m_type = b2Manifold.e_faceA;
					manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
					manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
					manifold.m_localPlaneNormal.Normalize();
					manifold.m_localPoint.Set(faceCenterX, faceCenterY);
					manifold.m_points[0].m_localPoint.SetV(circle.m_p);
					manifold.m_points[0].m_id.key = 0;
		      	}
		   	}







		   	this.s_incidentEdge = this.MakeClipPointVector();
		   	this.s_clipPoints1 = this.MakeClipPointVector();
		   	this.s_clipPoints2 = this.MakeClipPointVector();
		   	this.s_edgeA0 = box2D.NVector(1);
		   	this.s_edgeA1 = box2D.NVector(1);
		   	this.s_localTangent = new b2Vect2();
		   	this.s_localNormal = new b2Vect2();
		   	this.s_planePoint = new b2Vect2();
		   	this.s_normal = new b2Vect2();
		   	this.s_tangent = new b2Vect2();
		   	this.s_tangent2 = new b2Vect2();
		   	this.s_v11 = new b2Vect2();
		   	this.s_v12 = new b2Vect2();
		   	this.b2CollidenPolyTempVec = new b2Vect2();
		   	this.b2_nullFeature = 0x000000ff;
 		}).call(b2Collision);
 		module.exports = b2Collision;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
