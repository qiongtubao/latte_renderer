(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Math", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2");
 		var b2Math = function() {

 		};
 		(function() {

 		}).call(b2Math.prototype);
 		(function() {
 			var self = this;
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
 			this.Max = function(a, b) {
 				return Math.max(a || 0, b || 0);
 			}
 			this.MaxV = function(a ,b) {
 				var c = new b2Vec2(self.Max(a.x, b.x), self.Max(a.y, b.y));
 				return c;
 			}
 			this.Min = function(a, b) {
 				return Math.min(a || 0, b || 0);
 			}
 			this.MinV = function(a, b) {
 				var c = new b2Vec2(self.Min(a.x, b.x), self.Min(a.y, b.y));
 				return c;
 			}
 			this.Clamp = function(a, low, high) {
 				return self.MaxV(low, self.MinV(a, high));
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
		    }
		    */
		    this.MulMV = function(A, v) {
				var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
      			return u;
		    }
		    this.MulTMV = function(A, v) {
				var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
      			return u;
		    }
		    this.MulX= function(T, v) {
				var a = b2Math.MulMV(T.R, v);
				a.x += T.position.x;
				a.y += T.position.y;
				return a;
		    }
		    this.MulXT = function(T,v) {
				var a = self.SubtractVV(v, T.position);
				var tX = (a.x * T.R.col1.x + a.y * T.R.col1.y);
				a.y = (a.x * T.R.col2.x + a.y * T.R.col2.y);
				a.x = tX;
				return a;
		    }

 		}).call(b2Math);
 		module.exports = b2Math;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
