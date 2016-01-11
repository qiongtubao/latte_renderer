(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/clipVertex", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		// b2Collision ->
   		var b2Vec2 = require("../common/math/b2Vec2")
   			, b2ContactID = require("./b2ContactID");
   		var clipVertext = function() {
   			this.v = new b2Vec2();
   			this.id = new b2ContactID();
   		};
   		(function() {
   			this.Set = function(other) {
   				this.v.SetV(other.v);
   				this.id.Set(other.id);
   			}
   		}).call(clipVertext.prototype);
   		module.exports = clipVertext;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );