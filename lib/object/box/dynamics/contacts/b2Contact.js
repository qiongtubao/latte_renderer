(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2Contact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//基类
 		var b2ContactEdge = require("./b2ContactEdge")
 			, b2Manifold = require("../../collision/b2Manifold")
 			, b2TOIInput = require("../../collision/b2TOIInput")
 			, b2Body = require("../b2Body")
 			, b2Shape = require("../../collision/shapes/b2Shape")
 			, b2TimeOfImpact = require("../../collision/b2TimeOfImpact")
 			, b2Settings = require("../../common/b2Settings");
 		var b2Contact = function() {
 			this.m_nodeA = new b2ContactEdge();
 			this.m_nodeB = new b2ContactEdge();
 			this.m_manifold = new b2Manifold();
 			this.m_oldManifold = new b2Manifold();
 		};
 		(function() {
 			this.Reset = function(fixtureA, fixtureB) {
 				if(fixtureA === undefined) fixtureA = null;
 				if(fixtureB === undefined) fixtureB = null;
 				this.m_flags = b2Contact.e_enabledFlag;
 				if(!fixtureA || !fixtureB) {
 					this.m_fixtureA = null;
 					this.m_fixtureB = null;
 					return;
 				}
 				if(fixtureA.IsSensor() || fixtureB.IsSensor()) {
 					this.m_flags |= b2Contact.e_sensorFlag;
 				}
 				var bodyA = fixtureA.GetBody();
 				var bodyB = fixtureB.GetBody();
 				if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() 
 					|| bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
 					this.m_flags |= b2Contact.e_continuousFlag;
 				}
 				this.m_fixtureA = fixtureA;
 				this.m_fixtureB = fixtureB;
 				if(!this.m_manifold) {
 					debugger;
 				}
 				this.m_manifold.m_pointCount = 0;
 				this.m_prev = null;
 				this.m_next = null;
 				this.m_nodeA.contact = null;
 				this.m_nodeA.prev = null;
 				this.m_nodeA.next = null;
 				this.m_nodeA.other = null;
 				this.m_nodeB.contact = null;
 				this.m_nodeB.prev = null;
 				this.m_nodeB.next = null;
 				this.m_nodeB.other = null;
 			}
 			this.GetFixtureA = function() {
 				return this.m_fixtureA;
 			}
 			this.GetFixtureB = function() {
 				return this.m_fixtureB;
 			}
 			this.GetManifold = function() {
 				return this.m_manifold;
 			}
 			/**
 				更新碰撞对象list
 				@method Update
 				@param List<b2Contact>
 			*/
 			this.Update = function(listener) {
 				var tManifold = this.m_oldManifold;
 				this.m_oldManifold = this.m_manifold;
 				this.m_manifold = tManifold;
 				this.m_flags |= b2Contact.e_enabledFlag;
 				var touching = false;
 				var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
 				var bodyA = this.m_fixtureA.m_body;
 				var bodyB = this.m_fixtureB.m_body;
 				var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
 				if(this.m_flags & b2Contact.e_sensorFlag) {
 					if(aabbOverlap) {
					 	var shapeA = this.m_fixtureA.GetShape();
			            var shapeB = this.m_fixtureB.GetShape();
			            var xfA = bodyA.GetTransform();
			            var xfB = bodyB.GetTransform();
			            touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB);
 					}
 					this.m_manifold.m_pointCount = 0;
 				}else{
 					if(bodyA.GetType() != b2Body.b2_dynamicBody ||  bodyA.IsBullet()
 						|| bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
 						this.m_flags |= b2Contact.e_continuousFlag;
	 				}else{
	 					this.m_flags &= ~b2Contact.e_continuousFlag;
	 				}
	 				if(aabbOverlap) {
	 					this.Evaluate();
	 					touching = this.m_manifold.m_pointCount > 0;
	 					for(var i = 0; i < this.m_manifold.m_pointCount; i++) {
	 						var mp2 = this.m_manifold.m_points[i];
	 						mp2.m_normalImpulse = 0.0;
	 						mp2.m_tangentImpulse = 0.0;
	 						var id2 = mp2.m_id;
	 						for(var j = 0; j < this.m_oldManifold.m_pointCount; ++j) {
	 							var mp1 = this.m_oldManifold.m_points[i];
	 							if(mp1.m_id.key == id2.key) {
	 								mp2.m_normalImpulse = mp1.m_normalImpulse;
	 								mp2.m_tangentImpulse = mp1.m_tangentImpulse;
	 								break;
	 							}

	 						}
	 					}
	 				}else{
	 					this.m_manifold.m_pointCount = 0;
	 				}
	 				if(touching != wasTouching) {
	 					bodyA.SetAwake(true);
	 					bodyB.SetAwake(true);
	 				}
 				}
 				if(touching) {
 					this.m_flags |= b2Contact.e_touchingFlag;
 				}else{
 					this.m_flags &= ~b2Contact.e_touchingFlag;
 				}
 				if(wasTouching == false && touching == true) {
 					listener.BeginContact(this);
 				}
 				if(wasTouching == true && touching == false) {
 					listener.EndContact(this);
 				}
 				if((this.m_flags & b2Contact.e_sensorFlag) == 0) {
 					listener.PreSolve(this, this.m_oldManifold);
 				}
 			}
 			this.GetNext = function() {
 				return this.m_next;
 			}
 			this.IsSensor = function() {
 				return (this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag;
 			}
 			this.IsEnabled = function() {
 				return (this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag;
 			}
 			this.IsTouching = function () {
      			return (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
   			}
   			this.IsContinuous = function () {
      			return (this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag;
   			}
   			this.ComputeTOI = function(sweepA, sweepB) {
   				b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
   				b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
   				b2Contact.s_input.sweepA = sweepA;
   				b2Contact.s_input.sweepB = sweepB;
   				b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
   				return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input);
   			}
 		}).call(b2Contact.prototype);
 		(function() {
 			this.e_sensorFlag = 0x0001;
 			this.e_continuousFlag = 0x0002;
 			this.e_islandFlag = 0x0004;
 			this.e_toiFlag = 0x0008;
 			this.e_touchingFlag = 0x0010;
 			this.e_enabledFlag = 0x0020;
 			this.e_filterFlag = 0x0040;
 			this.s_input = new b2TOIInput();
 		}).call(b2Contact);
 		module.exports = b2Contact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
