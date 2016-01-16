(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Vec2", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = function(x, y) {
 			this.Set(x,y);
 		};
 		(function() {
 			Object.defineProperty(this, "x", {
		      	enumerable: true
			    , get: function() {
			      return this._x;
			    },
			    set: function(value) {
			    	if(isNaN(value)) {
			    		throw "????";
			    	}
			    	this._x = value;
			    }
		  	});
 			this.Set = function(x, y) {
 				if(x === undefined) x = 0;
 				if(y === undefined) y = 0;
 				this.x = x;
 				this.y = y;
 			}
 			this.SetZero = function(x,y) {
 				this.x = 0.0;
 				this.y = 0.0;
 			}
 			this.SetV = function(v) {
 				this.x = v.x;
 				this.y = v.y;
 			}
 			this.GetMegative = function() {
 				return new b2Vec2((-this.x), (-this.y));
 			}
 			this.NegativeSelf = function() {
 				this.x = (-this.x);
 				this.y = (-this.y);
 			}
 			this.Copy = function(x, y) {
 				return new b2Vec2(this.x, this.y)
 			}
 			this.Add = function(v) {
 				this.x += v.x;
 				this.y += v.y;
 			}
 			this.Subtract = function(v) {
 				this.x -= v.x;
      			this.y -= v.y;
 			}
 			this.Multiply = function(a) {
 				if(a === undefined) a = 0;
 				this.x *= a;
 				this.y *= a;
 			}
 			/**
 			this.MulM = function(A) {
 				var tX = this.x;
 				this.x = A.col1.x * tX + A.col2.x * this.y;
 				this.y = A.col1.y * tX + A.col2.y * this.y;
 			}
 			this.MulTM = function(A) {
 				var tX = b2Math.Dot(this, A.col1);
		      	this.y = b2Math.Dot(this, A.col2);
		      	this.x = tX; 
 			}
 			this.CrossVF = function(s) {
 				if( s === undefined ) s = 0;
 				var tX = this.x;
 				this.x = s * this.y;
 				this.y = (-s * tX);
 			}
 			this.CrossFV = function(s) {
 				if(s === undefined) s = 0;
 				var tX = this.x;
 				this.x = (-s * this.y);
 				this.y = s * tX;
 			}
 			*/
 			this.MinV = function(b) {
 				this.x = Math.min(this.x, b.x);
 				this.y = Math.min(this.y, b.y);
 			}
 			this.MaxV = function(b) {
 				this.x = Math.max(this.x, b.x);
 				this.y = Math.max(this.y, b.y);
 			}
 			this.Abs = function() {
 				this.x = Math.abs(this.x);
 				this.y = Math.abs(this.y);
 			}
 			this.Length = function() {
 				return Math.sqrt(this.x * this.x + this.y * this.y);
 			}
 			this.LengthSquared = function() {
 				return (this.x * this.x + this.y * this.y);
 			}
 			this.Normalize = function() {
 				var length = this.Length();
 				if(length < Number.MIN_VALUE) {
 					return 0.0;
 				}
 				var invLength = 1.0/length;
 				this.x *= invLength;
      			this.y *= invLength;
 				return length;
 			}
 			this.IsValid = function() {
 				return isFinite(this.x) && isFinite(this.y);
 			}
 			
 			this.GetNegative = function() {
 				return new b2Vec2((-this.x), (-this.y));
 			}
 		}).call(b2Vec2.prototype);
 		(function() {
 			
 			this.create = this.Make = function(x,y) {
 				return new b2Vec2(x,y);
 			}
 		}).call(b2Vec2);
 		module.exports = b2Vec2;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
