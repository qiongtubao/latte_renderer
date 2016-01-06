(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2Joint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Joint = function() {
            
   		};
   		(function() {
   			this.init = function() {
               this.m_normal = new b2Vec2();
               this.m_separations = b2Box.NVector(b2Settings.b2_maxManifoldPoints);
               this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
               for(var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
                  this.m_points[i] = new b2Vec2();
               }
            }
   		}).call(b2Joint.prototype);
         (function() {
            this.e_unknownJoint = 0;
            this.e_revoluteJoint = 1;
            this.e_prismaticJoint = 2;
            this.e_distanceJoint = 3;
            this.e_pulleyJoint = 4;
            this.e_mouseJoint = 5;
            this.e_gearJoint = 6;
            this.e_lineJoint = 7;
            this.e_weldJoint = 8;
            this.e_frictionJoint = 9;
            this.e_inactiveLimit = 0;
            this.e_atLowerLimit = 1;
            this.e_atUpperLimit = 2;
            this.e_equalLimits = 3;
         }).call(b2Joint);
   		module.exports = b2Joint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );