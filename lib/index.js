(function(define) {'use strict'
	define("latte_renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			var latte_lib = require("latte_lib");
 			var utils = require("./utils")
 			var renderers = new utils.HashMap();
 			var Renderer = require("./renderer")
 			this.get = function(element) {
 				
 				if(latte_lib.isString(element)) {
 					element = document.getElementById(element);
 					if(!element) {
 						var canvas = document.createElement("canvas");
 						canvas.id = element;
 						element = canvas;
 					}
 				}
 				if(!isDom(element,"canvas")) {
 					throw new Error("element type is not canvas  ");
 				}
 				var renderer = renderers.get(element);
 				if(!renderer) {
 					renderer = new Renderer(element);
 					renderers.push(element, renderer);
 				}
 				return renderer;
 			}

 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

