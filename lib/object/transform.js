(function(define) {'use strict'
	define("latte_renderer/object/transform", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Transform = function() {

 		};
 		(function() {
 			this.update = function(partnerTransform) {
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
 		}).call(Transform.prototype);
 		(function() {
 			this.create = function() {
 				return new Transform();
 			}
 		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
