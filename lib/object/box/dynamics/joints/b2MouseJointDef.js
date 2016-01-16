(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2MouseJointDef", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2JointDef = require("./b2JointDef")
            , b2Joint = require("./b2Joint")
            , latte_lib = require("latte_lib")
            , b2Vec2 = require("../../common/math/b2Vec2");
   		var b2MouseJointDef = function() {
                //b2JointDef.apply(this, arguments);
            this.target = new b2Vec2();
            this.init();
   		};
         latte_lib.inherits(b2MouseJointDef, b2JointDef);
   		(function() {
   			this.init = function() {
               b2JointDef.prototype.init.call(this);
               this.type = b2Joint.e_mouseJoint;
               this.maxForce = 0.0;
               this.frequencyHz = 5.0;
               this.dampingRatio = 0.7;
            }
   		}).call(b2MouseJointDef.prototype);
         (function() {
            
         }).call(b2MouseJointDef);
   		module.exports = b2MouseJointDef;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );