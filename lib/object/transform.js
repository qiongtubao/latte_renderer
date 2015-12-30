(function(define) {'use strict'
	define("latte_renderer/object/transform", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Transform = function(config) {
 			this.x = config.x || 0;
 			this.y = config.y || 0;
 			this.width = config.width || 0;
 			this.height = config.height || 0;
 			this.position = config.position || "relative";
 		};
 		(function() {
 			this.update = function(partnerTransform) {
 				if(!partnerTransform) { partnerTransform = Transform.defaultObject; }
 				var result = {};
 				switch(this.position) {
 					case "absolute":
 						result.x = this.x;
 						result.y = this.y;
 						result.width = this.width;
 						result.height = this.height;
 					break;
 					case "relative":
 					default:
 						result.x = partnerTransform.x + this.x;
		 				result.y = partnerTransform.y + this.y;
		 				result.width = this.width;
		 				result.height = this.height;
 					break;
 				}
 				return result;
 				//result.rotation = Transform.rotation(partnerTransform.rotation, this);

 			}
 			this.in = function(point, transform) {
 				if(transform.x < point.x && point.x < transform.x + transform.width 
 						&&  transform.y < point.y && point.y < transform.y + transform.height) {
 					return true;
 				}
 				return false;
 			}
 		}).call(Transform.prototype);
 		(function() {
 			this.defaultObject = {
 				x: 0,
 				y: 0,
 				width: 0,
 				height : 0
 			}
 		}).call(Transform);
 		(function() {
 			this.create = function(config) {
 				if(!config) {
 					config = {};
 				}
 				return new Transform(config);
 			}
 		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
