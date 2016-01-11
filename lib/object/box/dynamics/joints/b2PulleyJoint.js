(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2PulleyJoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2Joint = require("b2PulleyJoint")
            , latte_lib = require("latte_lib");
   		var b2PulleyJoint = function() {
               throw new "no ";
   		};
         latte_lib.inherits(b2PulleyJoint, b2Joint);
   		(function() {
   			
   		}).call(b2PulleyJoint.prototype);
         (function() {
            this.minPulleyLength = 2.0;
         }).call(b2PulleyJoint);
   		module.exports = b2PulleyJoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );