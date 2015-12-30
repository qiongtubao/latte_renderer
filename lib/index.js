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
 				var self = this;
 				this.type = type || Latte2D.defaultType;
	 			this.renderer = Renderer.create(element, this.type);
	 			this.root = LatteObject.create("root",{
	 				x: 0, y:0, width: this.renderer.width, height: this.renderer.height
	 			},{
	 				backgroundColor: "#000000"
	 			});
	 			var mouse = {
	 				x:0, y: 0
	 			};
	 			element.addEventListener("mousedown", function(event) {
	 				
	 			}, false);
	 			element.addEventListener("mouseup", function(event) {

	 			},false);
	 			element.addEventListener("click", function(event) {
	 				self.root.isDown({x: mouse.x, y: mouse.y},0);
	 			}, false);
	 			element.addEventListener("dblclick", function(event) {

	 			}, false);
	 			element.addEventListener("mousewheel", function(event) {

	 			}, false);
	 			element.addEventListener("mousemove", function(event) {
	 				var x, y;
	 				if(event.pageX || event.pageY) {
	 					x = event.pageX;
	 					y = event.pageY;
	 				}else{
	 					x = event.clientX + document.body.scrollLeft + 
	 						document.documentElement.scrollLeft;
	 					y = event.clientY + document.body.scrollTop + 
	 						document.documentElement.scrollTop;
	 				}
	 				x -= element.offsetLeft;
	 				y -= element.offsetTop;
	 				mouse.x = x;
	 				mouse.y = y; 
	 			}, false);
	 			element.addEventListener("mouseover", function(event) {

	 			}, false);
	 			element.addEventListener("mouseout", function(event) {

	 			}, false);
	 			var touch = {x: null, y: null, isPressed: false};
	 			element.addEventListener("touchstart", function(event) {
	 				touch.isPressed = true;
	 			}, false);
	 			element.addEventListener("touchend", function(event) {
	 				touch.isPressed = false;
	 				touch.x = null;
	 				touch.y = null;
	 			}, false);	
	 			element.addEventListener("touchmove", function(event) {
	 				var x , y;
	 				touch_event = event.touches[0];
	 				if(touch_event.pageX || touch_event.pageY) {
	 					x = touch_event.pageX;
	 					y = touch_event.pageY;
	 				}else{
	 					x = touch_event.clientX + document.body.scrollLeft + 
	 						document.documentElement.scrollLeft;
	 					y = touch_event.clientY + document.body.scrollTop +
	 						document.documentElement.scrollTop;
	 				}
	 				x -= offsetLeft;
	 				y -= offsetTop;
	 				touch.x  = x;
	 				touch.y = y;
	 			}, false);

 			};
 			latte_lib.inherits(Latte2D, latte_lib.events);
 			(function() {
 				this.setRoot = function(func) {
 					func.call(this.root);
 				}
 				this.run = function() {
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
	 			this.startOne = function() {
	 				this.run();
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

