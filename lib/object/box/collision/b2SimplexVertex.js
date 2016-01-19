(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2SimplexVertex", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2SimplexVertex = function() {

   		};
   		(function() {
   			this.Set = function(other) {
   				this.wA.SetV(other.wA);
		      	this.wB.SetV(other.wB);
		      	this.w.SetV(other.w);
		      	this.a = other.a;
		      	this.indexA = other.indexA;
		      	this.indexB = other.indexB;
   			}
   		}).call(b2SimplexVertex.prototype);
   		module.exports = b2SimplexVertex;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );