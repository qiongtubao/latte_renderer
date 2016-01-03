(function(define) { 'use strict';
   define("latte_renderer/object/box/index", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		(function() {
   			this.parseUInt = function(v) {
	   			return Math.abs(parseInt(v));
	   		}
   		}).call(module.exports);
   		
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );