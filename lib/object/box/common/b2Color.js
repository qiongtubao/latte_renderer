(function(define) {'use strict'
	define("latte_renderer/object/box/common/b2Color", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_box2d = require("../index")
   			, mMath = require("./math/b2Math");

   		var Color = function(rr,gg,bb) {
            this._r = 0;
            this._g = 0;
            this._b = 0;
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
   			this.Set = this.init = function(rr, gg, bb) {
   				rr = rr || 0;
   				gg = gg || 0;
   				bb = bb || 0;
   				this._r = latte_box2d.parseUInt(255 * mMath.Clamp(rr, 0.0, 1.0));
   				this._g = latte_box2d.parseUInt(255 * mMath.Clamp(gg, 0.0, 1.0));
   				this._b = latte_box2d.parseUInt(255 * mMath.Clamp(bb, 0.0, 1.0));
   			}
   		}).call(Color.prototype);
   		module.exports = Color;
  	
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
