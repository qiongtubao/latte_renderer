(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Collision", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var box2D = require("../index")
 			, b2Vect2 = require("../common/math/b2Vect2");
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
