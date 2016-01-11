(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2World", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactManager = require("./b2ContactManager")
 			, b2Contact = require("./contacts/b2Contact")
 			, b2ContactSolver = require("./b2ContactSolver")
 			, b2Island = require("./b2Island")
 			, b2Body = require("./b2Body")
 			, b2TimeStep = require("./b2TimeStep")
 			, b2Transform = require("../common/math/b2Transform")
 			, b2Sweep = require("../common/math/b2Sweep")
 			, b2Color = require("../common/b2Color")
 			, b2BodyDef = require("./b2BodyDef")
 			, b2Settings = require("../common/b2Settings")
 			, b2Vec2 = require("../common/math/b2Vec2")
 			, b2AABB = require("../collision/b2AABB")
 			, b2DebugDraw = require("./b2DebugDraw")
 			, b2Shape = require("../collision/shapes/b2Shape")
 			, b2PolygonShape = require("../collision/shapes/b2PolygonShape")
 			, b2CircleShape = require("../collision/shapes/b2CircleShape")
 			, b2EdgeShape = require("../collision/shapes/b2EdgeShape")
 			, b2Math = require("../common/math/b2Math");
 		var b2World = function(gravity, doSleep) {
 			this.s_stack = new Array();
 			this.m_contactManager = new b2ContactManager();
 			this.m_contactSolver = new b2ContactSolver();
 			this.m_island = new b2Island();
 			this.init(gravity, doSleep);
 		};
 		(function() {
 			this.init = function(gravity, doSleep) {
 				this.m_destructionListener = null;
 				this.m_debugDraw = null;
 				this.m_bodyList = null;
 				this.m_contactList = null;
 				this.m_jointList = null;
 				this.m_controllerList = null;
 				this.m_bodyCount = 0;
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
 				if(this.IsLocked() == true) { return null; }
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
 								this.DrawShape(s, xf, color);
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
 			/**
 			this.Step ->
 			@Solve 计算位置的
 			*/
 			this.Solve = function (step) {
		      var b;
		      for (var controller = this.m_controllerList; controller; controller = controller.m_next) {
		         controller.Step(step);
		      }
		      var island = this.m_island;
		      island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
		      for (b = this.m_bodyList;b; b = b.m_next) {
		         b.m_flags &= ~b2Body.e_islandFlag;
		      }
		      for (var c = this.m_contactList; c; c = c.m_next) {
		         c.m_flags &= ~b2Contact.e_islandFlag;
		      }
		      for (var j = this.m_jointList; j; j = j.m_next) {
		         j.m_islandFlag = false;
		      }
		      var stackSize = parseInt(this.m_bodyCount);
		      var stack = this.s_stack;
		      for (var seed = this.m_bodyList; seed; seed = seed.m_next) {
		         if (seed.m_flags & b2Body.e_islandFlag) {
		            continue;
		         }
		         if (seed.IsAwake() == false || seed.IsActive() == false) {
		            continue;
		         }
		         if (seed.GetType() == b2Body.b2_staticBody) {
		            continue;
		         }
		         island.Clear();
		         var stackCount = 0;
		         stack[stackCount++] = seed;
		         seed.m_flags |= b2Body.e_islandFlag;
		         while (stackCount > 0) {
		            b = stack[--stackCount];
		            island.AddBody(b);
		            if (b.IsAwake() == false) {
		               b.SetAwake(true);
		            }
		            if (b.GetType() == b2Body.b2_staticBody) {
		               continue;
		            }
		            var other;
		            for (var ce = b.m_contactList; ce; ce = ce.next) {
		               if (ce.contact.m_flags & b2Contact.e_islandFlag) {
		                  continue;
		               }
		               if (ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
		                  continue;
		               }
		               island.AddContact(ce.contact);
		               ce.contact.m_flags |= b2Contact.e_islandFlag;
		               other = ce.other;
		               if (other.m_flags & b2Body.e_islandFlag) {
		                  continue;
		               }
		               stack[stackCount++] = other;
		               other.m_flags |= b2Body.e_islandFlag;
		            }
		            for (var jn = b.m_jointList; jn; jn = jn.next) {
		               if (jn.joint.m_islandFlag == true) {
		                  continue;
		               }
		               other = jn.other;
		               if (other.IsActive() == false) {
		                  continue;
		               }
		               island.AddJoint(jn.joint);
		               jn.joint.m_islandFlag = true;
		               if (other.m_flags & b2Body.e_islandFlag) {
		                  continue;
		               }
		               stack[stackCount++] = other;
		               other.m_flags |= b2Body.e_islandFlag;
		            }
		         }
		         island.Solve(step, this.m_gravity, this.m_allowSleep);
		         for (var i = 0; i < island.m_bodyCount; ++i) {
		            b = island.m_bodies[i];
		            if (b.GetType() == b2Body.b2_staticBody) {
		               b.m_flags &= ~b2Body.e_islandFlag;
		            }
		         }
		      }
		      for (i = 0; i < stack.length; ++i) {
		         if (!stack[i]) break;
		         stack[i] = null;
		      }
		      for (b = this.m_bodyList; b; b = b.m_next) {
		         if (b.IsAwake() == false || b.IsActive() == false) {
		            continue;
		         }
		         if (b.GetType() == b2Body.b2_staticBody) {
		            continue;
		         }
		         b.SynchronizeFixtures();
		      }
		      this.m_contactManager.FindNewContacts();
		   }
		   this.SolveTOI = function (step) {
		      var b;
		      var fA;
		      var fB;
		      var bA;
		      var bB;
		      var cEdge;
		      var j;
		      var island = this.m_island;
		      island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
		      var queue = b2World.s_queue;
		      for (b = this.m_bodyList;
		      b; b = b.m_next) {
		         b.m_flags &= ~b2Body.e_islandFlag;
		         b.m_sweep.t0 = 0.0;
		      }
		      var c;
		      for (c = this.m_contactList;
		      c; c = c.m_next) {
		         c.m_flags &= ~ (b2Contact.e_toiFlag | b2Contact.e_islandFlag);
		      }
		      for (j = this.m_jointList;
		      j; j = j.m_next) {
		         j.m_islandFlag = false;
		      }
		      for (;;) {
		         var minContact = null;
		         var minTOI = 1.0;
		         for (c = this.m_contactList;
		         c; c = c.m_next) {
		            if (c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
		               continue;
		            }
		            var toi = 1.0;
		            if (c.m_flags & b2Contact.e_toiFlag) {
		               toi = c.m_toi;
		            }
		            else {
		               fA = c.m_fixtureA;
		               fB = c.m_fixtureB;
		               bA = fA.m_body;
		               bB = fB.m_body;
		               if ((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
		                  continue;
		               }
		               var t0 = bA.m_sweep.t0;
		               if (bA.m_sweep.t0 < bB.m_sweep.t0) {
		                  t0 = bB.m_sweep.t0;
		                  bA.m_sweep.Advance(t0);
		               }
		               else if (bB.m_sweep.t0 < bA.m_sweep.t0) {
		                  t0 = bA.m_sweep.t0;
		                  bB.m_sweep.Advance(t0);
		               }
		               toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
		               b2Settings.b2Assert(0.0 <= toi && toi <= 1.0);
		               if (toi > 0.0 && toi < 1.0) {
		                  toi = (1.0 - toi) * t0 + toi;
		                  if (toi > 1) toi = 1;
		               }
		               c.m_toi = toi;
		               c.m_flags |= b2Contact.e_toiFlag;
		            }
		            if (Number.MIN_VALUE < toi && toi < minTOI) {
		               minContact = c;
		               minTOI = toi;
		            }
		         }
		         if (minContact == null || 1.0 - 100.0 * Number.MIN_VALUE < minTOI) {
		            break;
		         }
		         fA = minContact.m_fixtureA;
		         fB = minContact.m_fixtureB;
		         bA = fA.m_body;
		         bB = fB.m_body;
		         b2World.s_backupA.Set(bA.m_sweep);
		         b2World.s_backupB.Set(bB.m_sweep);
		         bA.Advance(minTOI);
		         bB.Advance(minTOI);
		         minContact.Update(this.m_contactManager.m_contactListener);
		         minContact.m_flags &= ~b2Contact.e_toiFlag;
		         if (minContact.IsSensor() == true || minContact.IsEnabled() == false) {
		            bA.m_sweep.Set(b2World.s_backupA);
		            bB.m_sweep.Set(b2World.s_backupB);
		            bA.SynchronizeTransform();
		            bB.SynchronizeTransform();
		            continue;
		         }
		         if (minContact.IsTouching() == false) {
		            continue;
		         }
		         var seed = bA;
		         if (seed.GetType() != b2Body.b2_dynamicBody) {
		            seed = bB;
		         }
		         island.Clear();
		         var queueStart = 0;
		         var queueSize = 0;
		         queue[queueStart + queueSize++] = seed;
		         seed.m_flags |= b2Body.e_islandFlag;
		         while (queueSize > 0) {
		            b = queue[queueStart++];
		            --queueSize;
		            island.AddBody(b);
		            if (b.IsAwake() == false) {
		               b.SetAwake(true);
		            }
		            if (b.GetType() != b2Body.b2_dynamicBody) {
		               continue;
		            }
		            for (cEdge = b.m_contactList;
		            cEdge; cEdge = cEdge.next) {
		               if (island.m_contactCount == island.m_contactCapacity) {
		                  break;
		               }
		               if (cEdge.contact.m_flags & b2Contact.e_islandFlag) {
		                  continue;
		               }
		               if (cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
		                  continue;
		               }
		               island.AddContact(cEdge.contact);
		               cEdge.contact.m_flags |= b2Contact.e_islandFlag;
		               var other = cEdge.other;
		               if (other.m_flags & b2Body.e_islandFlag) {
		                  continue;
		               }
		               if (other.GetType() != b2Body.b2_staticBody) {
		                  other.Advance(minTOI);
		                  other.SetAwake(true);
		               }
		               queue[queueStart + queueSize] = other;
		               ++queueSize;
		               other.m_flags |= b2Body.e_islandFlag;
		            }
		            for (var jEdge = b.m_jointList; jEdge; jEdge = jEdge.next) {
		               if (island.m_jointCount == island.m_jointCapacity) continue;
		               if (jEdge.joint.m_islandFlag == true) continue;
		               other = jEdge.other;
		               if (other.IsActive() == false) {
		                  continue;
		               }
		               island.AddJoint(jEdge.joint);
		               jEdge.joint.m_islandFlag = true;
		               if (other.m_flags & b2Body.e_islandFlag) continue;
		               if (other.GetType() != b2Body.b2_staticBody) {
		                  other.Advance(minTOI);
		                  other.SetAwake(true);
		               }
		               queue[queueStart + queueSize] = other;
		               ++queueSize;
		               other.m_flags |= b2Body.e_islandFlag;
		            }
		         }
		         var subStep = b2World.s_timestep;
		         subStep.warmStarting = false;
		         subStep.dt = (1.0 - minTOI) * step.dt;
		         subStep.inv_dt = 1.0 / subStep.dt;
		         subStep.dtRatio = 0.0;
		         subStep.velocityIterations = step.velocityIterations;
		         subStep.positionIterations = step.positionIterations;
		         island.SolveTOI(subStep);
		         var i = 0;
		         for (i = 0;
		         i < island.m_bodyCount; ++i) {
		            b = island.m_bodies[i];
		            b.m_flags &= ~b2Body.e_islandFlag;
		            if (b.IsAwake() == false) {
		               continue;
		            }
		            if (b.GetType() != b2Body.b2_dynamicBody) {
		               continue;
		            }
		            b.SynchronizeFixtures();
		            for (cEdge = b.m_contactList;
		            cEdge; cEdge = cEdge.next) {
		               cEdge.contact.m_flags &= ~b2Contact.e_toiFlag;
		            }
		         }
		         for (i = 0;
		         i < island.m_contactCount; ++i) {
		            c = island.m_contacts[i];
		            c.m_flags &= ~ (b2Contact.e_toiFlag | b2Contact.e_islandFlag);
		         }
		         for (i = 0;
		         i < island.m_jointCount; ++i) {
		            j = island.m_joints[i];
		            j.m_islandFlag = false;
		         }
		         this.m_contactManager.FindNewContacts();
		      }
		   }
		   this.DrawShape = function(shape, xf, color) {
		   		switch (shape.m_type) {
			      case b2Shape.e_circleShape:
			         {
			            var circle = ((shape instanceof b2CircleShape ? shape : null));
			            var center = b2Math.MulX(xf, circle.m_p);
			            var radius = circle.m_radius;
			            var axis = xf.R.col1;
			            this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
			         }
			         break;
			      case b2Shape.e_polygonShape:
			         {
			            var i = 0;
			            var poly = ((shape instanceof b2PolygonShape ? shape : null));
			            var vertexCount = parseInt(poly.GetVertexCount());
			            var localVertices = poly.GetVertices();
			            var vertices = new Array(vertexCount);
			            for (i = 0;
			            i < vertexCount; ++i) {
			               vertices[i] = b2Math.MulX(xf, localVertices[i]);
			            }
			            this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
			         }
			         break;
			      case b2Shape.e_edgeShape:
			         {
			            var edge = (shape instanceof b2EdgeShape ? shape : null);
			            this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
			         }
			         break;
		      	}
		   }
		   this.ClearForces = function() {
		   		for (var body = this.m_bodyList; body; body = body.m_next) {
		         	body.m_force.SetZero();
		         	body.m_torque = 0.0;
		      	}
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
		}).call(b2World);
 		module.exports = b2World;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
