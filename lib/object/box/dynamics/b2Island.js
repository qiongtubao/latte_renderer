(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2Island", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var Settings = require("../common/b2Settings")
            , mMath = require("../common/math/b2Math")
            , b2ContactImpulse = require("./b2ContactImpulse");
   		var Island = function() {
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_bodies = new Array();
	      		this.m_contacts = new Array();
	      		this.m_joints = new Array();
   			}

            this.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
               if(bodyCapacity === undefined) bodyCapacity = 0;
               if(contactCapacity === undefined) contactCapacity = 0;
               if(jointCapacity === undefined) jointCapacity = 0;
               var i = 0;
               this.m_bodyCapacity = bodyCapacity;
               this.m_contactCapacity = contactCapacity;
               this.m_jointCapacity = jointCapacity;
               this.m_bodyCount = 0;
               this.m_contactCount = 0;
               this.m_jointCount = 0;
               this.m_allocator = allocator;
               this.m_listener = listener;
               this.m_contactSolver = contactSolver;
               for(i = this.m_bodies.length; i < bodyCapacity; i++) {
                  this.m_bodies[i] = null;
               }
               for( i = this.m_contacts.length; i < contactCapacity; i++) {
                  this.m_contacts[i] = null;
               }
               for( i = this.m_joints.length; i < jointCapacity; i++) {
                  this.m_joints[i] = null;
               }
            }

            this.Clear = function() {
               this.m_bodyCount = 0;
               this.m_contactCount = 0;
               this.m_jointCount = 0;
            }
            /**
               @method addBody
               @param body {dynamics.Body}
            */
            this.AddBody = function(body) {
               body.m_islandIndex = this.m_bodyCount;
               this.m_bodies[this.m_bodyCount++] = body;
            }
            /**
               @method solve
               @param step
               @param gravity
               @param allowSleep
            */
            this.Solve = function(step, gravity, allowSleep) {
               var i = 0
                  , j = 0
                  , b , joint;
               for(i = 0; i < this.m_bodyCount ; ++i) {
                  b = this.m_bodies[i];
                  if(b.getType() != Body.dynamicBody) continue;
                  b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
                  b.m_linearVelocity.y += step.dt * (gravity.x + b.m_invMass * b.m_force.y);
                  b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
                  b.m_linearVelocity.multiply(mMath.clamp(1.0 - step.dt * b.m_linearDamping, 0.0, 1.0));
                  b.m_angularVelocity *= mMath.clamp(1.0 - step.dt * b.m_angularDamping, 0.0, 1.0);
               }
               this.m_contactSolver.initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
               var contactSolver = this.m_contactSolver;
               contactSolver.initVelocityConstraints(step);
               for( i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.initVelocityConstraints(step);
               }
               for(i = 0; i < step.velocityIterations; ++i) {
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     joint.solveVelocityConstraints(step);
                  }
                  contactSolver.solveVelocityConstraints();
               }
               for(i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.finalizeVelocityConstraints();
               }
               contactSolver.finalizeVelocityConstraints();
               for(i = 0; i < this.m_bodyCount; ++i) {
                  b = this.m_bodies[i];
                  if(b.getType() == Body.staticBody) { continue; }
                  var translationX = step.dt * b.m_linearVelocity.x;
                  var translationY = step.dt * b.m_linearVelocity.y;
                  if((translationX * translationX + translationY * translationY) > Settings.maxTranslationSquared ) {
                     b.m_linearVelocity.normalize();
                     b.m_linearVelocity.x *= Settings.maxTranslation * step.inv_dt;
                     b.m_linearVelocity.y *= Settings.maxTranslation * step.inv_dt;
                  }
                  var rotation = step.dt * b.m_angularVelocity;
                  if(rotation * rotation > Settings.maxRotationSquared) {
                     
                        b.m_angularVelocity = 
                           b.m_angularVelocity < 0.0 ? 
                           (-Settings.maxRotation * step.inv_dt): 
                           Settings.maxRotation * step.inv_dt;
                     
                  }
                  b.m_sweep.c0.setV(b.m_sweep.c);
                  b.m_sweep.a0 = b.m_sweep.a;
                  b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
                  b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
                  b.m_sweep.a += step.dt * b.m_angularVelocity;

                  b.synchronizeTransform();
               }
               for(i = 0 ; i < step.positionIterations; ++i) {
                  var contactsOkay = contactSolver.solvePositionConstraints(Settings.b2_contactBaumgarte);
                  var jointsOkay = true;
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     var jointOkay = joint.solvePositionConstraints(Settings.b2_contactBaumgarte);jointsOkay
                     jointsOkay = jointsOkay && jointOkay;
                  }
                  if(contactsOkay && jointsOkay) {
                     break;
                  }
               }
               this.report(contactSolver.m_constraints);
               if(allowSleep) {
                  var minSleepTime = Number.MAX_VALUE;
                  var linTolSqr = Settings.linearSlinearSleepTolerance * Settings.linearSlinearSleepTolerance;
                  var angTolSqr = Settings.angularSleepTolerance * Settings.angularSleepTolerance;
                  for( i = 0 ; i < this.m_bodyCount; ++i) {
                     b = this.m_bodies[i];
                     if(b.getType() == Body.staticBody) {
                        continue;
                     }
                     if((b.m_flags & Body.e_allowSleepFlag) == 0) {
                        b.m_sleepTime = 0.0;
                        minSleepTime = 0.0;
                     }
                     if((b.m_flags & Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || mMath.dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
                        b.m_sleepTime = 0.0;
                        minSleepTime = 0.0;
                     }else{
                        b.m_sleepTime += step.dt;
                        minSleepTime = mMath.min(minSleepTime, b.m_sleepTime);
                     }
                  }
                  if(minSleepTime >= Settings.timeToSleep) {
                     for( i = 0; i < this.m_bodyCount; ++i) {
                        b = this.m_bodies[i];
                        b.setAwake(false);
                     }
                  }
               }
            }
            /**
               island.solve -> Report
            */
            this.Report = function(constraints) {
               if (this.m_listener == null) {
                  return;
               }
               for (var i = 0; i < this.m_contactCount; ++i) {
                  var c = this.m_contacts[i];
                  var cc = constraints[i];
                  for (var j = 0; j < cc.pointCount; ++j) {
                     Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
                     Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
                  }
                  this.m_listener.postSolve(c, Island.s_impulse);
               }     
            }
   		}).call(Island.prototype);
         (function() {
            this.s_impulse = new b2ContactImpulse();
         }).call(Island);
   		module.exports = Island;
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );