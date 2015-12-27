(function(define) {'use strict'
	define("latte_renderer/renderer/3D/renderer3D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Renderer2D = function(element, type) {
 			this.context = element.getContext("2d");
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
 						this.context.fillStyle = command.fillStyle;
 						iamge = utils.getImage(command.image);

 						this.context.drawImage(image, command.x, command.y, command.height, command.width);
 					
 					break;
 				}
 			}
 		}).call(Renderer2D.prototype);

 		module.exports = Renderer2D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
