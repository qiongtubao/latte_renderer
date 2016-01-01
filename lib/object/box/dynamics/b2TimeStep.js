(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2TimeStep", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {

   		var TimeStep = function() {
   			
   		};
   		(function() {
   			this.set = function(step) {
               this.dt = step.dt;
               this.inv_dt = step.inv_dt;
               this.positionIterations = step.positionIterations;
               this.velocityIterations = step.velocityIterations;
               this.warmStarting = step.warmStarting;
            }
   		}).call(TimeStep.prototype);
   		module.exports = TimeStep;
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );