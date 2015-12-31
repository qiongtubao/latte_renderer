(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Mat22", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Mat22 = function() {
 			this.col1 = new b2Vec2();
 			this.col2 = new b2Vec2();
 		};
 		(function() {
 			this.init = this.SetIdentity = function() {
 				this.col1.x = 1.0;
 				this.col2.x = 0.0;
 				this.col1.y = 0.0;
 				this.col2.y = 1.0;
 			}
 			this.SetZero = function() {
 				this.col1.x = 0.0;
 				this.col2.x = 0.0;
 				this.col1.y = 0.0;
 				this.col2.x = 0.0;
 			}
 			this.FromAngle = function(angle) {
 				if(angle === undefined) angle = 0;
 				var mat = new b2Mat22();
 				mat.Set(angle);
 				return mat;
 			}

 			this.FromVV = function(c1, c2) {
 				var mat = new b2Mat22();
 				mat.SetVV(c1, c2);
 				return mat;
 			}
 			this.Set = function(angle) {
 				if(angle === undefined) angle = 0;
 				var c = Math.cos(angle);
 				var s = Math.sin(angle);
 				this.col1.x = c;
 				this.col2.x = (-s);
 				this.col1.y = s;
 				this.col2.y = c;
 			}
 			this.SetVV = function(c1, c2) {
 				this.col1.SetV(c1);
 				this.col2.SetV(c2);
 			}
 			this.Copy = function() {
 				var mat = new b2Mat22();
		      	mat.SetM(this);
		      	return mat;
 			}
 		}).call(b2Mat22.prototype);
 		module.exports = b2Mat22;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
