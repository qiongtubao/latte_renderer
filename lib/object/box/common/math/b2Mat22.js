(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Mat22", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2");
 		//存角度的
 		var b2Mat22 = function() {
 			this.col1 = new b2Vec2();
 			this.col2 = new b2Vec2();
 			this.init();
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
 			this.SetM = function(m) {
 				this.col1.SetV(m.col1);
  				this.col2.SetV(m.col2);
 			}
 		}).call(b2Mat22.prototype);
		(function() {
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
		}).call(b2Mat22);
 		module.exports = b2Mat22;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
