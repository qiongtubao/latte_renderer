(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Distance", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var box2D = require("../index")
 			, b2Simplex = require("./b2Simplex");
 		var b2Distance = function() {

 		};
 		(function() {

 		}).call(b2Distance.prototype);
 		(function() {
 			this.s_simplex = new b2Simplex();
 			this.s_saveA = box2D.NVector(3);
 			this.s_saveB = box2D.NVector(3);
 		}).call(b2Distance);
 		module.exports = b2Distance;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
