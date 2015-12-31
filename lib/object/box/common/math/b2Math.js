(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Math", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Math = function() {

 		};
 		(function() {

 		}).call(b2Math.prototype);
 		(function() {
 			this.IsValid = function(x) {
 				if(x === undefined) x = 0;
 				return isFinite(x);
 			}
 			this.Dot = function(a, b) {
 				return a.x * b.x + a.y * b.y;
 			}
 			this.CrossVV = function(a, b) {
 				return a.x * b.y - a.y * b.x;
 			}
 			/**
 			this.CrossVF = function(a, s) {
 				if (s === undefined) s = 0;
				var v = new b2Vec2(s * a.y, (-s * a.x));
				return v;
 			}
 			this.CrossFV = function (s, a) {
		      if (s === undefined) s = 0;
		      var v = new b2Vec2((-s * a.y), s * a.x);
		      return v;
		    }*/
 		}).call(b2Math);
 		module.exports = b2Math;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
