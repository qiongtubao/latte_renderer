(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/shapes/b2MassData", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Vec2 = require("../../common/math/b2Vec2")
   			, Shape = require("./b2Shape")
   			, latte_lib = require("latte_lib");
   		var MassData = function() {
   			this.mass = 0.0;
   			this.center = new Vec2(0, 0);
   			this.I = 0.0;
   		};
   		latte_lib.inherits(MassData, Shape);
   		(function() {
   			this.init = function() {
   				Shape.call(this, arguments);
   			}
   		}).call(MassData.prototype);
   		module.exports = MassData;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );