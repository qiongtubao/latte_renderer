(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Transform", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2")
 			, b2Mat22 = require("./b2Mat22");
 		var b2Transform = function(pos, r) {
 			this.position = new b2Vec2();
 			this.R = new b2Mat22();
 			this.init(pos, r);
 		};
 		(function() {
 			this.init = function(pos, r) {
 				if(pos === undefined) pos = null;
 				if(r === undefined) r = null;
 				if(pos) {
 					this.position.SetV(pos);
 					this.R.SetM(r);
 				}
 			}
 			this.SetIdentity = function() {
 				this.position.SetZero();
 				this.R.setIdentity();
 			}
 			this.Set = function(x) {
 				this.position.SetV(x.position);
 				this.R.SetM(x.R);
 			}
 			//atan2(y,x)所表达的意思是坐标原点为起点，指向(x,y)的射线在坐标平面上与x轴正方向之间的角的角度。
 			this.GetAngle = function() {
 				return Math.atan2(this.R.col1.y, this.R.col1.x);
 			}
 		}).call(b2Transform.prototype);
 		module.exports = b2Transform;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
