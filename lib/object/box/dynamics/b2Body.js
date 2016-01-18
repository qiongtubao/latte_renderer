(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2Body", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Transform = require("../common/math/b2Transform")
 			, b2Sweep = require("../common/math/b2Sweep")
 			, b2Vec2 = require("../common/math/b2Vec2")
 			, b2Fixture = require("./b2Fixture")
 			,b2Settings = require("../common/b2Settings")
 			, b2Math = require("../common/math/b2Math")
 			;

 		var b2Body = function(bd, world) {
 			this.m_xf = new b2Transform();
 			this.m_sweep = new b2Sweep();
 			this.m_linearVelocity = new b2Vec2();
 			this.m_force = new b2Vec2();

 			this.init(bd,world);
 		};
 		(function() {
 			Object.defineProperty(this, "m_angularVelocity", {
		         enumerable: true
		       , get: function() {
		         return this._m_angularVelocity;
		       },
		       set: function(value) {
	       		console.log(value);
	       		if(value != 0) {
	       			debugger;
	       		}
		         this._m_angularVelocity = value;
		       }
		   });
 			Object.defineProperty(this, "m_flags", {
		         enumerable: true
		       , get: function() {
		         return this._m_flags;
		       },
		       set: function(value) {
	       			if(value == 39 || value == 38) {
	       				debugger;
	       			}
		         this._m_flags = value;
		       }
		   });
 			this.init = function(bd, world) {
 				this.m_flags = 0;
 				if(bd.bullet) {
 					this.m_flags |= b2Body.e_bulletFlag;
 				}
 				if(bd.fixedRotation) {
 					this.m_flags |= b2Body.e_fixedRotationFlag;
 				}
 				if(bd.allowSleep) {
 					this.m_flags |= b2Body.e_allowSleepFlag;
 				}
 				if (bd.awake) {
		         	this.m_flags |= b2Body.e_awakeFlag;
		      	}
		      	if (bd.active) {
		         	this.m_flags |= b2Body.e_activeFlag;
		      	}

		      	this.m_world = world;
		      	//设置坐标
		      	this.m_xf.position.SetV(bd.position);
		      	//设置角度
		      	this.m_xf.R.Set(bd.angle);
		      	
		      	this.m_sweep.localCenter.SetZero();
		      	this.m_sweep.t0 = 1.0;
		      	this.m_sweep.a0 = this.m_sweep.a = bd.angle;
		      	var tMat = this.m_xf.R;
		      	var tVec = this.m_sweep.localCenter;
		      	this.m_sweep.c.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
		      	this.m_sweep.c.y = (tMat.col1.y * tVec.y + tMat.col2.y * tVec.y);
		      	this.m_sweep.c.x += this.m_xf.position.x;
		      	this.m_sweep.c.y += this.m_xf.position.y;
		      	this.m_sweep.c0.SetV(this.m_sweep.c);
		      	this.m_jointList = null;
		      	this.m_controllerList = null;
		      	this.m_contactList = null;
		      	this.m_controllerCount = 0;
		      	this.m_prev = null;
		      	this.m_next = null;
		      	this.m_linearVelocity.SetV(bd.linearVelocity);
		      	this.m_angularVelocity = bd.angularVelocity;
		      	this.m_linearDamping = bd.linearDamping;
		      	this.m_angularDamping = bd.angularDamping;
		      	this.m_force.Set(0.0,0.0);
		      	this.m_torque = 0.0;
		      	this.m_sleepTime = 0.0;
		      	this.m_type = bd.type;
		      	if(this.m_type == b2Body.b2_dynamicBody) {
		      		this.m_mass = 1.0;
		      		this.m_invMass = 1.0;
		      	} else {
		         this.m_mass = 0.0;
		         this.m_invMass = 0.0;
		      }
		      	this.m_I = 0.0;
      			this.m_invI = 0.0;
		      	this.m_inertiaScale = bd.inertiaScale;
		      	this.m_userData = bd.userData;
		      	this.m_fixtureList = null;
		      	this.m_fixtureCount = 0;

 			}
 			this.CreateFixture = function(def) {
 				var  b2World = require("./b2World");
	 				if(this.m_world.IsLocked() == true) {
	 					return null;
	 				}
 				var fixture = new b2Fixture();
			      fixture.Create(this, this.m_xf, def);
			      if (this.m_flags & b2Body.e_activeFlag) {
			         var broadPhase = this.m_world.m_contactManager.m_broadPhase;
			         fixture.CreateProxy(broadPhase, this.m_xf);
			      }
			      fixture.m_next = this.m_fixtureList;
			      this.m_fixtureList = fixture;
			      ++this.m_fixtureCount;
			      fixture.m_body = this;
			      if (fixture.m_density > 0.0) {
			         this.ResetMassData();
			      }
			      this.m_world.m_flags |= b2World.e_newFixture;
			      return fixture;
 			}
 			this.ResetMassData = function() {
 				this.m_mass = 0.0;
 				this.m_invMass = 0.0;
 				this.m_I = 0.0;
 				this.m_invI = 0.0;
 				this.m_sweep.localCenter.SetZero();
 				if(this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
 					return;
 				}
 				var center = b2Vec2.Make(0, 0);
 				for(var f = this.m_fixtureList; f; f=f.m_next) {
 					if(f.m_density == 0.0) {
 						continue;
 					}
 					var massData = f.GetMassData();
 					this.m_mass += massData.mass;
 					center.x += massData.center.x * massData.mass;
 					center.y += massData.center.y * massData.mass;
 					this.m_I = massData.I;
 				}
 				if(this.m_mass > 0.0) {
 					this.m_invMass = 1.0/this.m_mass;
 					center.x *= this.m_invMass;
 					center.y *= this.m_invMass;
 				}else{
 					this.m_mass = 1.0;
 					this.m_invMass = 1.0;
 				}
 				if(this.m_I > 0.0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {

 					this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
 					this.m_I *= this.m_inertiaScale;
 					b2Settings.b2Assert(this.m_I > 0);
 					this.m_invI = 1.0 / this.m_I;
 				}else {
 					this.m_I = 0.0;
 					this.m_invI = 0.0;
 				}
 				var oldCenter = this.m_sweep.c.Copy();
 				this.m_sweep.localCenter.SetV(center);
 				this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
 				this.m_sweep.c.SetV(this.m_sweep.c0);
 				this.m_linearVelocity.x += this.m_angularVelocity * (-(this.m_sweep.c.y - oldCenter.y));
 				this.m_linearVelocity.y += this.m_angularVelocity * (+(this.m_sweep.c.x - oldCenter.y));
 			}
 			this.IsAwake = function () {
		      return (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
		    }
		    /**
		    	b2World.DrawDebugData ->
		    */
		    this.GetFixtureList = function () {
      			return this.m_fixtureList;
   			}
   			this.IsActive = function () {
      			return (this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag;
   			}
   			this.GetContactList = function () {
      			return this.m_contactList;
   			}
   			this.ShouldCollide = function(other) {
   				if(this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
   					return false;
   				}
   				for(var jn = this.m_jointList; jn ; jn = jn.next) {
   					if(jn.other == other && jn.joint.m_collideConnected == false) {
   						return false;
   					}
   				}
   				return true;
   			}
   			this.GetType = function() {
   				return this.m_type;
   			}
   			this.IsBullet = function() {
   				return (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
   			}
   			this.GetTransform = function() {
   				return this.m_xf;
   			}
   			this.SynchronizeTransform = function() {
   				this.m_xf.R.Set(this.m_sweep.a);
   				var tMat = this.m_xf.R;
   				var tVec = this.m_sweep.localCenter;
   				this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
   				this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y  * tVec.y);
   			}
   			this.SynchronizeFixtures = function() {
   				var xf1 = b2Body.s_xf1;
			      xf1.R.Set(this.m_sweep.a0);
			      var tMat = xf1.R;
			      var tVec = this.m_sweep.localCenter;
			      xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
			      xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
			      var f;
			      var broadPhase = this.m_world.m_contactManager.m_broadPhase;
			      for (f = this.m_fixtureList;f; f = f.m_next) {
			         f.Synchronize(broadPhase, xf1, this.m_xf);
			      }
   			}
   			this.SetAwake = function(flag) {
   				if (flag) {
					this.m_flags |= b2Body.e_awakeFlag;
					this.m_sleepTime = 0.0;
		      	}else {
					this.m_flags &= ~b2Body.e_awakeFlag;
					this.m_sleepTime = 0.0;
					this.m_linearVelocity.SetZero();
					this.m_angularVelocity = 0.0;
					this.m_force.SetZero();
					this.m_torque = 0.0;
		      	}
   			}
   			this.GetMass = function() {
   				return this.m_mass;
   			}
   			//b2MouseJoint.GetAnchorB->
   			this.GetWorldPoint = function (localPoint) {
		      var A = this.m_xf.R;
		      var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
		      u.x += this.m_xf.position.x;
		      u.y += this.m_xf.position.y;
		      return u;
		   }

 		}).call(b2Body.prototype);
 		(function() {
 			this.s_xf1 = new b2Transform();
 			this.e_islandFlag = 0x0001;
 			this.e_awakeFlag = 0x0002;
 			this.e_allowSleepFlag = 0x0004;
 			this.e_bulletFlag = 0x0008;
 			this.e_fixedRotationFlag = 0x0010;
 			this.e_activeFlag = 0x0020;
 			
 			this.b2_staticBody = 0;// 静态
 			this.b2_kinematicBody = 1;//动态物体
 			this.b2_dynamicBody = 2;//运动学物体

 		}).call(b2Body);
 		module.exports = b2Body;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
