(function(define) {'use strict'
	define("latte_renderer/utils/lib", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			this.isDom =  ( typeof HTMLElement === 'object' ) ?
            function(obj){
                return obj instanceof HTMLElement;
            } :
            function(obj){
                return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
            }
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
