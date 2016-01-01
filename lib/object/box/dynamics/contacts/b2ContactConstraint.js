(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactConstraint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../../common/math/b2Vec2")
 			 ,b2Mat22 = require("../../common/math/b2Mat22")
 			 , b2Settings = require("../../common/b2Settings")
 			 , b2ContactConstraintPoint = require("./b2ContactConstraintPoint");
 		var b2ContactConstraint = function() {
 			this.localPlaneNormal = new b2Vec2();
 			this.localPoint = new b2Vec2();
 			this.normal = new b2Vec2();
 			this.normalMass = new b2Mat22();
 			this.K = new b2Mat22();
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.points = new Array(b2Settings.b2_maxManifoldPoints);
 				for(var i = 0; i <  b2Settings.b2_maxManifoldPoints; i++) {
 					this.points[i] = new b2ContactConstraintPoint();
 				}
 			}
 		}).call(b2ContactConstraint.prototype);
 		module.exports = b2ContactConstraint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
