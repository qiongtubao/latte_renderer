(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2SimplexCache", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		//b2TimeOfImpact ->
   		var b2Box = require("../index");
   		var b2SimplexCache = function() {
   			this.indexA = b2Box.NVector(3);
   			this.indexB = b2Box.NVector(3);
   		};
   		(function() {
   			
   		}).call(b2SimplexCache.prototype);
   		(function() {
   			
   		}).call(b2SimplexCache);
   		module.exports = b2SimplexCache;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );