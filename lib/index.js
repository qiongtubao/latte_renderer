(function(define) {'use strict'
	define("latte_renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			var latte_lib = require("latte_lib");
 			var HashMap = require("./utils/hashMap")
 			var latte2ds = new HashMap();
 			var utils = require("./utils/lib");
 			var Renderer = require('./renderer')
 			, LatteObject = require("./object");	
 			var Latte2D = function(element, type) {
 				this.type = type || Latte2D.defaultType;
	 			this.renderer = Renderer.create(element, this.type);
	 			this.root = LatteObject.create("root", {
	 				point: {
	 					x: 0,
	 					y: 0
	 				}
	 			});
 			};
 			latte_lib.inherits(Latte2D, latte_lib.events);
 			(function() {
 				this.run = function() {
 					this.renderer.clear();
 					var result = [];
	 				this.root.update(0, result);
	 				this.renderer.draw(result);	
	 			}
	 			this.add = function(path, object) {
	 				this.root.add(path, object);
	 			}
	 			this.query = function(path) {
	 				return this.root.query(path);
	 			}
	 			this.start = function() {
	 				var self = this;
	 				var frame = function() {
	 					self.run();
	 					requestAnimationFrame(frame);
	 				};
	 				requestAnimationFrame(frame);
	 				
	 			}
 			}).call(Latte2D.prototype);
 			(function() {
 				this.types = {
 					"2d": {

 					},
 					"3d": {

 					}
 				}
 				this.defaultType = (function() {
 					return "2d";
 				})();
 			}).call(Latte2D);

 			this.get = function(element) {
 				
 				if(latte_lib.isString(element)) {
 					element = document.getElementById(element);
 					if(!element) {
 						var canvas = document.createElement("canvas");
 						canvas.id = element;
 						element = canvas;
 					}
 				}
 				if(!utils.isDom(element,"canvas")) {
 					throw new Error("element type is not canvas  ");
 				}
 				var latte2d = latte2ds.get(element);
 				if(!renderer) {
 					latte2d = new Latte2D(element);
 					latte2ds.push(element, latte2d);
 				}
 				return latte2d;
 			}
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

