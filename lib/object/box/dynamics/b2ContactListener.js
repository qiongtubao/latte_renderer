(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactListener", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2ContactListener = function() {

	   	};
	   	(function() {
	   		/**
	   			b2Contact.prototype.Update ->
	   			@method BeginContact
	   		*/
	   		this.BeginContact = function(contact) {

	   		}
	   		this.EndContact = function(contact) {

	   		}
	   		/**
	   			@method PreSolve
	   			@param contact {b2Contact}
	   			@param manifold {b2Manifold}
	   			
	   		*/
	   		this.PreSolve = function(contact, manifold) {
	   			
	   		}
	   		this.PostSolve = function(contact, impulse) {

	   		}
	   	}).call(b2ContactListener.prototype);
	   	(function() {
	   		this.defaultListener = new b2ContactListener();
	   	}).call(b2ContactListener);
	   	
	   	module.exports = b2ContactListener;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );