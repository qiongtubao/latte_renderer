(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DistanceOutput", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../common/math/b2Vec2");
 		var b2DistanceOutput = function() {
 			this.pointA = new b2Vec2();
 			this.pointB = new b2Vec2();
 		};
 		(function() {
 			
 		}).call(b2DistanceOutput.prototype);
 		module.exports = b2DistanceOutput;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
