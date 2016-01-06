(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2PulleyJoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2PulleyJoint = function() {
            
   		};
   		(function() {
   			
   		}).call(b2PulleyJoint.prototype);
         (function() {
            this.minPulleyLength = 2.0;
         }).call(b2PulleyJoint);
   		module.exports = b2PulleyJoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );