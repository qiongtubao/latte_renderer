(function(define) {'use strict'
	define("latte_renderer/objects/2D/transform2D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Vector2 = require("../../math/Vector2");
 		var Transform2D = function() {
 			//位置
 			this.point = new Vector2();			
 			//尺度
 			this.scale = new Vector2(1,1);
 			//旋转
 			this.rotation = new Euler();
 			//四元
 			this.quaternion = new Quaternion();


 		};
 		(function() {

 		}).call(Transform2D.prototype);
 		module.exports = Transform2D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
