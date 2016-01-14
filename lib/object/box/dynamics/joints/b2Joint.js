(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2Joint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2JointEdge = require("./b2JointEdge")
            , b2Vec2 = require("../../common/math/b2Vec2");
   		var b2Joint = function() {
            this.m_edgeA = new b2JointEdge();
            this.m_edgeB = new b2JointEdge();
            this.m_localCenterA = new b2Vec2();
            this.m_localCenterB = new b2Vec2();
   		};
   		(function() {
            this.init = function(def) {
               b2Settings.b2Assert(def.bodyA != def.bodyB);
               this.m_type = def.type;
               this.m_prev = null;
               this.m_next = null;
               this.m_bodyA = def.bodyA;
               this.m_bodyB = def.bodyB;
               this.m_collideConnected = def.collideConnected;
               this.m_islandFlag = false;
               this.m_userData = def.userData;
            }
            /**
   			this._init = function() {
               this.m_normal = new b2Vec2();
               this.m_separations = b2Box.NVector(b2Settings.b2_maxManifoldPoints);
               this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
               for(var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
                  this.m_points[i] = new b2Vec2();
               }
            }
            */
   		}).call(b2Joint.prototype);
         (function() {
            this.Create = function(def, allocator) {
               var joint = null;
               switch(def.type) {
                  case b2Joint.e_distanceJoint:
                     var b2DistanceJoint = require("./b2DistanceJoint")
                        , b2DistanceJointDef = require("./b2DistanceJointDef");
                     joint = new b2DistanceJoint((def instanceof b2DistanceJointDef)? def: null);
                  break;
                  case b2Joint.e_mouseJoint:
                     var b2MouseJoint = require("./b2MouseJoint")
                        , b2MouseJointDef = require("./b2MouseJointDef");
                     joint = new b2MouseJoint((def instanceof b2MouseJointDef)? def: null);
                  break;
                  case b2Joint.e_prismaticJoint:
                     var b2PrismaticJoint = require("./b2PrismaticJoint")
                        , b2PrismaticJointDef = require("./b2PrismaticJointDef");
                     joint = new b2PrismaticJoint((def instanceof b2PrismaticJointDef)? def: null);
                  break;
                  case b2Joint.e_revoluteJoint:
                     var b2RevoluteJoint = require("./b2RevoluteJoint")
                        , b2RevoluteJointDef = require("./b2RevoluteJointDef");
                     joint = new b2RevoluteJoint((def instanceof b2RevoluteJointDef)? def: null);
                  break;
                  case b2Joint.e_pulleyJoint:
                     var b2PulleyJoint = require("./b2PulleyJoint")
                        , b2PulleyJointDef = require("./b2PulleyJointDef");
                     joint = new b2PulleyJoint((def instanceof b2PulleyJointDef)? def: null);
                  break;
                  case b2Joint.e_gearJoint:
                     var b2GearJoint = require("./b2GearJoint")
                        , b2GearJointDef = require("./b2GearJointDef");
                     joint = new b2GearJoint((def instanceof b2GearJointDef)? def: null);
                  break;
                  case b2Joint.e_lineJoint:
                     var b2LineJoint = require("./b2LineJoint")
                        , b2LineJointDef = require("./b2LineJointDef");
                     joint = new b2LineJoint((def instanceof b2LineJointDef)? def: null);
                  break;
                  case b2Joint.e_weldJoint:
                     var b2WeldJoint = require("./b2WeldJoint")
                        , b2WeldJointDef = require("./b2WeldJointDef");
                     joint = new b2WeldJoint((def instanceof b2WeldJointDef)? def: null);
                  break;
                  case b2Joint.e_frictionJoint:
                     var b2FrictionJoint = require("./b2FrictionJoint")
                        ,b2FrictionJointDef = require("./b2FrictionJointDef");
                     joint = new b2FrictionJoint((def instanceof b2FrictionJointDef)? def: null);
                  break;
               }
            }

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