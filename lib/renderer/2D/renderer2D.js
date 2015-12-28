(function(define) {'use strict'
	define("latte_renderer/renderer/2D/renderer2D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Renderer2D = function(element, type) {
 			this.context = element.getContext("2d");
 			this.width = element.width;
 			this.height = element.height;
 		};
 		(function() {
 			this.draw = function(commands) {
 				var self = this;
 				commands.forEach(function(command) {
 					self.drawOne(command);
 				});
 			}
 			this.drawOne = function(command) {
 				switch(command.type) {
 					case "image":
 						var image = command.image;
 						this.context.drawIamge(image.resources, image.x, image.y, image.width, image.height,
 								command.x, command.y, command.width || image.width, command.height || image.height);
 					break;
 				}
 			}
 			this.clear = function() {
 				this.context.clearRect(0,0,this.width, this.height);
 			}
 		}).call(Renderer2D.prototype);

 		module.exports = Renderer2D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
