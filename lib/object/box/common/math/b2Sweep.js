(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Sweep", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2");
 		var b2Sweep = function() {
 			this.localCenter = new b2Vec2();
 			this.c0 = new b2Vec2();
 			this.c = new b2Vec2();
 		};
 		(function() {
 			Object.defineProperty(b2Sweep.prototype, "t0", {
               enumerable: true
             , get: function() {
               return this._t0;
             },
             set: function(value) {
                  console.log(value);
                  this._t0 = value;
             }
         });
 			this.Set = function(other) {
 				this.localCenter.SetV(other.localCenter);
 				this.c0.SetV(other.c0);
 				this.c.SetV(other.c);
 				this.a0 = other.a0;
 				this.a = other.a;
 				this.t0 = other.t0;
 			}
 			this.Copy = function() {
 				var copy = new b2Sweep();
 				copy.Set(this);
 				return this;
 			}
 			//
 			this.GetTransform = function(xf, alpha) {
 				if(alpha === undefined) alpha = 0;
 				xf.position.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
 				xf.position.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
 				var angle = (1.0 - alpha) * this.a0 + alpha * this.a;
 				xf.R.Set(angle);
 				var tMat = xf.R;
 				xf.position.x -= (tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y);
 				xf.position.y -= (tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y);
 			}
 			this.Advance = function(t) {
 				if(t === undefined) t = 0;
 				if(this.t0 < t && 1.0 - this.t0 > Number.MIN_VALUE) {
 					var alpha = (t - this.t0)/ (1.0 - this.t0);
 					this.c0.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
 					this.c0.y = (1.0 - alpha) * this.c0.y + alpha * tihs.c.y;
 					this.a0 = (1.0 -alpha) * this.a0 + alpha * this.a;
 					this.t0 = t;
 				}
 			}
 			
 		}).call(b2Sweep.prototype);
 		module.exports = b2Sweep;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
