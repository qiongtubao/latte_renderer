(function(define) {'use strict'
	define("latte_renderer/renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Renderer2D = require('./2D/renderer2D')
 			, Renderer3D = require("./3D/renderer3D")
 			, Object2D = require("../objects/2D/object2D")
 			, Object3D = require("../objects/3D/object3D");
 		var Renderer = function(element, type) {
 			this.type = type || Renderer.defulatType;
 			var all = Renderer.types[ this.type];
 			if(!all) {
 				throw new Error("no renderer");
 			}
 			this.renderer = new all.renderer();
 			this.root = new all.object();
 		};
 		(function() {
 			this.run = function(object) {
 				var commands = object.update();
 				renderer.draw(commands);	
 			}
 		}).call(Renderer.prototype);
 		(function() {
 			this.set = function(path, object) {
 				this.root.set.set(path, object);
 			}
 			this.defulatType = (function() {
 				return "2d";
 			})();
 			this.types = {
 				"2d": {
 					renderer: Renderer2D,
 					object: Object2D
 				},
 				"3d": {
 					renderer: Renderer3D,
 					object: Object3D
 				}
 			};
 		}).call(Renderer);
 		module.exports = Renderer;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
