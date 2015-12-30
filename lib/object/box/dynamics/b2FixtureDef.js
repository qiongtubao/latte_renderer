(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2FixtureDef", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2FixtureDef = function() {
 			this.filter = new b2FilterData();
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.shape = null;
	 			this.userData = null;
	 			this.friction = 0.2;
	 			this.restitution = 0.0;
	 			this.density = 0.0;
	 			this.filter.categoryBits = 0x0001;
	 			this.filter.groupIndex = 0;
	 			this.isSensor = false;
 			}
 		}).call(b2FixtureDef.prototype);
 		module.exports = b2FixtureDef;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
