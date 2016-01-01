(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactListener", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var ContactListener = function() {

	   	};
	   	(function() {
	   		this.preSolve = function(contact, oldManifold) {

	   		}
	   	}).call(ContactListener.prototype);
	   	ContactListener.defaultListener = new ContactListener();
	   	module.exports = ContactListener;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );