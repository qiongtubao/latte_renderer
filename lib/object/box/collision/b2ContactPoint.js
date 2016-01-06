(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2ContactPoint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../common/math/b2Vec2")
 			, b2ContactID = require("./b2ContactID");
 		var b2ContactPoint = function() {
 			this.position = new b2Vec2();
 			this.velocity = new b2Vec2();
 			this.normal = new b2Vec2();
 			this.id = new b2ContactID();
 		};
 		(function() {

 		}).call(b2ContactPoint.prototype);
 		module.exports = b2ContactPoint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
