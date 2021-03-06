(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2Island", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2Settings = require("../common/b2Settings")
            , mMath = require("../common/math/b2Math")
            , b2ContactImpulse = require("./b2ContactImpulse")
            , b2Body = require("./b2Body");
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
               b2World.Solve ->
               @method Solve 
               更新速度
               @param step  速度
               @param gravity  重力
               @param allowSleep  
            */
            this.Solve = function(step, gravity, allowSleep) {
               var i = 0
                  , j = 0
                  , b , joint;
               for(i = 0; i < this.m_bodyCount ; ++i) {
                  b = this.m_bodies[i];
                  if(b.GetType() != b2Body.b2_dynamicBody) continue;
                  b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
                  b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
                  b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
                  b.m_linearVelocity.Multiply(mMath.Clamp(1.0 - step.dt * b.m_linearDamping, 0.0, 1.0));
                  b.m_angularVelocity *= mMath.Clamp(1.0 - step.dt * b.m_angularDamping, 0.0, 1.0);
               }
               this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
               var contactSolver = this.m_contactSolver;
               contactSolver.initVelocityConstraints(step);
               for( i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.InitVelocityConstraints(step);
               }
               for(i = 0; i < step.velocityIterations; ++i) {
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     joint.SolveVelocityConstraints(step);
                  }
                  contactSolver.SolveVelocityConstraints();
               }
               for(i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.FinalizeVelocityConstraints();
               }
               contactSolver.finalizeVelocityConstraints();
               for(i = 0; i < this.m_bodyCount; ++i) {
                  b = this.m_bodies[i];
                  if(b.GetType() == b2Body.b2_staticBody) { continue; }
                  var translationX = step.dt * b.m_linearVelocity.x;
                  var translationY = step.dt * b.m_linearVelocity.y;
                  if((translationX * translationX + translationY * translationY) > b2Settings.maxTranslationSquared ) {
                     b.m_linearVelocity.normalize();
                     b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
                     b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt;
                  }
                  var rotation = step.dt * b.m_angularVelocity;
                  if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
                     
                        b.m_angularVelocity = 
                           b.m_angularVelocity < 0.0 ? 
                           (-b2Settings.b2_maxRotation * step.inv_dt): 
                           b2Settings.b2_maxRotation * step.inv_dt;
                     
                  }
                  b.m_sweep.c0.SetV(b.m_sweep.c);
                  b.m_sweep.a0 = b.m_sweep.a;
                  b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
                  b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
                  b.m_sweep.a += step.dt * b.m_angularVelocity;

                  b.SynchronizeTransform();
               }
               for(i = 0 ; i < step.positionIterations; ++i) {
                  var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
                  var jointsOkay = true;
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);jointsOkay
                     jointsOkay = jointsOkay && jointOkay;
                  }
                  if(contactsOkay && jointsOkay) {
                     break;
                  }
               }
               this.Report(contactSolver.m_constraints);
               if(allowSleep) {
                  var minSleepTime = Number.MAX_VALUE;
                  var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
                  var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
                  for( i = 0 ; i < this.m_bodyCount; ++i) {
                     b = this.m_bodies[i];
                     if(b.GetType() == b2Body.b2_staticBody) {
                        continue;
                     }
                     if(
                        (b.m_flags & b2Body.e_allowSleepFlag) == 0 || 
                        b.m_angularVelocity * b.m_angularVelocity > angTolSqr || 
                        mMath.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr
                        ) {
                        b.m_sleepTime = 0.0;
                        minSleepTime = 0.0;
                     }else{
                        b.m_sleepTime += step.dt;
                        minSleepTime = mMath.Min(minSleepTime, b.m_sleepTime);
                     }
                  }
                  
                  if(minSleepTime >= b2Settings.b2_timeToSleep) {
                     for( i = 0; i < this.m_bodyCount; ++i) {
                        b = this.m_bodies[i];
                        b.SetAwake(false);
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
                  this.m_listener.PostSolve(c, Island.s_impulse);
               }     
            }
            /**
               @method AddContact
               @param contact {Contact}
            */
            this.AddContact = function(contact) {
               this.m_contacts[this.m_contactCount++] = contact;
            }
            this.AddJoint = function(joint) {
               this.m_joints[this.m_jointCount++] = joint;
            }
            /**
               b2World.SolveTOI->
            */
            this.SolveTOI= function(subStep) {
               var i = 0;
               var j = 0;
               this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
               var contactSolver = this.m_contactSolver;
               for (i = 0;
               i < this.m_jointCount; ++i) {
                  this.m_joints[i].InitVelocityConstraints(subStep);
               }
               for (i = 0;
               i < subStep.velocityIterations; ++i) {
                  contactSolver.SolveVelocityConstraints();
                  for (j = 0;
                  j < this.m_jointCount; ++j) {
                     this.m_joints[j].SolveVelocityConstraints(subStep);
                  }
               }
               for (i = 0;
               i < this.m_bodyCount; ++i) {
                  var b = this.m_bodies[i];
                  if (b.GetType() == b2Body.b2_staticBody) continue;
                  var translationX = subStep.dt * b.m_linearVelocity.x;
                  var translationY = subStep.dt * b.m_linearVelocity.y;
                  if ((translationX * translationX + translationY * translationY) > b2Settings.b2_maxTranslationSquared) {
                     b.m_linearVelocity.Normalize();
                     b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
                     b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt;
                  }
                  var rotation = subStep.dt * b.m_angularVelocity;
                  if (rotation * rotation > b2Settings.b2_maxRotationSquared) {
                     if (b.m_angularVelocity < 0.0) {
                        b.m_angularVelocity = (-b2Settings.b2_maxRotation * subStep.inv_dt);
                     }
                     else {
                        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt;
                     }
                  }
                  b.m_sweep.c0.SetV(b.m_sweep.c);
                  b.m_sweep.a0 = b.m_sweep.a;
                  b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
                  b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
                  b.m_sweep.a += subStep.dt * b.m_angularVelocity;
                  b.SynchronizeTransform();
               }
               var k_toiBaumgarte = 0.75;
               for (i = 0;
               i < subStep.positionIterations; ++i) {
                  var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
                  var jointsOkay = true;
                  for (j = 0;
                  j < this.m_jointCount; ++j) {
                     var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
                     jointsOkay = jointsOkay && jointOkay;
                  }
                  if (contactsOkay && jointsOkay) {
                     break;
                  }
               }
               this.Report(contactSolver.m_constraints);
            }
   		}).call(Island.prototype);
         (function() {
            this.s_impulse = new b2ContactImpulse();
         }).call(Island);
   		module.exports = Island;
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );