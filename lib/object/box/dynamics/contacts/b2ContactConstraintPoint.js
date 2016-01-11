(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactConstraintPoint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../../common/math/b2Vec2");
 		var b2ContactConstraintPoint = function() {
 			this.localPoint = new b2Vec2();
 			this.rA = new b2Vec2();
 			this.rB = new b2Vec2();
 		};
 		(function() {
 			
 		}).call(b2ContactConstraintPoint.prototype);
 		module.exports = b2ContactConstraintPoint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
