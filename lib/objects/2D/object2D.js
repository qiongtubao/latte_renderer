(function(define) {'use strict'
	define("latte_renderer/objects/2D/object2D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var ObjectBase = require("../objectBase");
 		var Object2D = function(options, transform) {
 			ObjectBase.call(this, options);
 			this.type = "Object2D";
 			//
 			this.transform = new Transform2D()
 		};
 		latte_lib.inherits(Object2D, ObjectBase);
 		(function() {
 			
 		}).call(Object2D.prototype);
 		module.exports = Object2D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
