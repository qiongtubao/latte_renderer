(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2JointDef", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2Joint = require("./b2Joint")
   		var b2JointDef = function() {
               b2JointDef.prototype.init.call(this);
   		};
   		(function() {
   			this.init = function() {
               this.type = b2Joint.e_unknownJoint;
               this.userData = null;
               this.bodyA = null;
               this.bodyB = null;
               this.collideConnected = false;
            }
   		}).call(b2JointDef.prototype);
         (function() {
            
         }).call(b2JointDef);
   		module.exports = b2JointDef;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );