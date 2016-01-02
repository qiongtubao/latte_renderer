(function(define) {'use strict'
	define("latte_renderer/object/box/common/b2Color", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_box2d = require("latte_box2d")
   			, mMath = require("./math/math");

   		var Color = function(rr,gg,bb) {
   			this.init(rr,gg,bb);
   		};
   		(function(){
            Object.defineProperty(this, 'color', {
               enumerable: false,
               configurable: true,
               get: function () {
                  return (this._r << 16) | (this._g << 8) | (this._b);
               }
            });
   			this.set = this.init = function(rr, gg, bb) {
   				rr = rr || 0;
   				gg = gg || 0;
   				bb = bb || 0;
   				this._r = latte_box2d.parseUInt(255 * mMath.clamp(rr, 0.0, 1.0));
   				this._g = latte_box2d.parseUInt(255 * mMath.clamp(gg, 0.0, 1.0));
   				this._b = latte_box2d.parseUInt(255 * mMath.clamp(bb, 0.0, 1.0));
   			}
   		}).call(Color.prototype);
   		module.exports = Color;
  	
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
