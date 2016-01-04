(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2World", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactManager = require("./b2ContactManager")
 			, b2ContactSolver = require("./b2ContactSolver")
 			, b2Island = require("./b2Island")
 			, b2Body = require("./b2Body")
 			, b2TimeStep = require("./b2TimeStep")
 			, b2Transform = require("../common/math/b2Transform")
 			, b2Sweep = require("../common/math/b2Sweep")
 			, b2Color = require("../common/b2Color");
 		var b2World = function() {
 			this.s_stack = new Array();
 			this.m_contactManager = new b2ContactManager();
 			this.m_contactSolver = new b2ContactSolver();
 			this.m_island = new b2Island();
 		};
 		(function() {
 			this.init = function() {
 				this.m_destructionListener = null;
 				this.m_debugDraw = null;
 				this.m_bodyList = null;
 				this.m_contactList = null;
 				this.m_jointList = null;
 				this.m_controllerCount = 0;
 				this.m_jointCount = 0;
 				this.m_controllerCount = 0;
 				b2World.m_warmStarting = true;
 				b2World.m_continuousPhysics = true;
 				this.m_allowSleep = doSleep;
 				this.m_gravity = gravity;
 				this.m_inv_dt0 = 0.0;
 				this.m_contactManager.m_world = this;
 				var bd = new b2BodyDef();
 				this.m_groundBody = this.CreateBody(bd);
 			}
 			this.CreateBody = function(def) {
 				if(this.IsLocked == true) { return null; }
 				var b = new b2Body(def, this);
 				b.m_prev = null;
 				b.m_next = this.m_bodyList;
 				if(this.m_bodyList) {
 					this.m_bodyList.m_prev = b;
 				}
 				this.m_bodyList = b ;
 				++this.m_bodyCount;
 				return b;
 			}
 			this.IsLocked = function () {
      			return (this.m_flags & b2World.e_locked) > 0;
   			}
 			this.SetDebugDraw = function(debugDraw) {
 				this.m_debugDraw = debugDraw;
 			}
 			this.DrawDebugData = function() {
 				if(this.m_debugDraw == null) {
 					return ;
 				}
 				this.m_debugDraw.m_sprite.graphics.clear();
 				var flags = this.m_debugDraw.GetFlags();
 				var i = 0;
 				var b;
 				var f;
 				var s;
 				var j;
 				var bp;
 				var invQ = new b2Vec2();
 				var x1 = new b2Vec2();
 				var x2 = new b2Vec2();
 				var xf;
 				var b1 = new b2AABB();
 				var b2 = new b2AABB();
 				var vs = [new b2Vec2(), new b2Vec2(), new b2Vec2(), new b2Vec2()];
 				var color = new b2Color(0,0,0);
 				if(flags & b2DebugDraw.e_shapeBit) {
 					for(b = this.m_bodyList; b ;b = b.m_next) {
 						xf = b.m_xf;
 						for(f = b.GetFixtureList(); f ;f = f.m_next) {
 							s = f.GetShape();
 							if(b.IsActive() == false) {
 								color.Set(0.5,0.5,0.3);
 								this.DrawShape(s, xf, color);
 							}else if(b.GetType() == b2Body.b2_staticBody) {
 								color.Set(0.5,0.9,0.5);
 								this.DrawShape(s, xf, color);
 							}else if(b.GetType() == b2Body.b2_kinematicBody) {
 								color.Set(0.5, 0.5, 0.9);
 								this.DrawShape(s, xf, color);
 							} else{
 								color.Set(0.9,0.7,0.7);
 							}

 						}
 					}
 				}
 				if(flags & b2DebugDraw.e_jointBit) {
 					for(j = this.m_jointList; j; j=j.m_next) {
 						this.DrawJoint(j);
 					}
 				}
 				 if (flags & b2DebugDraw.e_pairBit) {
			         color.Set(0.3, 0.9, 0.9);
			         for (var contact = this.m_contactManager.m_contactList; contact; contact = contact.GetNext()) {
			            var fixtureA = contact.GetFixtureA();
			            var fixtureB = contact.GetFixtureB();
			            var cA = fixtureA.GetAABB().GetCenter();
			            var cB = fixtureB.GetAABB().GetCenter();
			            this.m_debugDraw.DrawSegment(cA, cB, color);
			         }
			      }
			      if (flags & b2DebugDraw.e_aabbBit) {
			         bp = this.m_contactManager.m_broadPhase;
			         vs = [new b2Vec2(), new b2Vec2(), new b2Vec2(), new b2Vec2()];
			         for (b = this.m_bodyList;
			         b; b = b.GetNext()) {
			            if (b.IsActive() == false) {
			               continue;
			            }
			            for (f = b.GetFixtureList();
			            f; f = f.GetNext()) {
			               var aabb = bp.GetFatAABB(f.m_proxy);
			               vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
			               vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
			               vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
			               vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
			               this.m_debugDraw.DrawPolygon(vs, 4, color);
			            }
			         }
			      }
			      if (flags & b2DebugDraw.e_centerOfMassBit) {
			         for (b = this.m_bodyList;
			         b; b = b.m_next) {
			            xf = b2World.s_xf;
			            xf.R = b.m_xf.R;
			            xf.position = b.GetWorldCenter();
			            this.m_debugDraw.DrawTransform(xf);
			         }
			      }
 			}
 			this.Step = function(dt, velocityIterations, positionIterations) {
 				debugger;
 				if (dt === undefined) dt = 0;
			      if (velocityIterations === undefined) velocityIterations = 0;
			      if (positionIterations === undefined) positionIterations = 0;
			      if (this.m_flags & b2World.e_newFixture) {
			         this.m_contactManager.FindNewContacts();
			         this.m_flags &= ~b2World.e_newFixture;
			      }
			      this.m_flags |= b2World.e_locked;
			      var step = b2World.s_timestep2;
			      step.dt = dt;
			      step.velocityIterations = velocityIterations;
			      step.positionIterations = positionIterations;
			      if (dt > 0.0) {
			         step.inv_dt = 1.0 / dt;
			      }
			      else {
			         step.inv_dt = 0.0;
			      }
			      step.dtRatio = this.m_inv_dt0 * dt;
			      step.warmStarting = b2World.m_warmStarting;
			      this.m_contactManager.Collide();
			      if (step.dt > 0.0) {
			         this.Solve(step);
			      }
			      if (b2World.m_continuousPhysics && step.dt > 0.0) {
			         this.SolveTOI(step);
			      }
			      if (step.dt > 0.0) {
			         this.m_inv_dt0 = step.inv_dt;
			      }
			      this.m_flags &= ~b2World.e_locked;
 			}
 		}).call(b2World.prototype);
		(function() {
			this.s_timestep2 = new b2TimeStep();
			this.s_xf = new b2Transform();
			this.s_backupA = new b2Sweep();
			this.s_backupB = new b2Sweep();
			this.s_timestep = new b2TimeStep();
			this.s_queue = new Array();
			this.s_jointColor = new b2Color(0.5, 0.8, 0.8);
			this.e_newFixture = 0x0001;
			this.e_locked = 0x0002;
		}).call(module.exports);
 		module.exports = b2World;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
