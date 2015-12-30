(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2Body", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Body = function() {

 		};
 		(function() {
 			this.b2_staticBody = 0;
 			this.b2_kinematicBody = 1;
 			this.b2_dynamicBody = 2;
 		}).call(b2Body);
 		module.exports = b2Body;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
