(function(define) {'use strict'
	define("latte_renderer/renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			var self = this;
 			this.renderers = {
 				"2d": require("./2D/renderer2D"),
 				"3d": require("./3D/renderer3D")
 			}
 			this.create = function(element, type) {
 				return new self.renderers[type](element);
 			}
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
