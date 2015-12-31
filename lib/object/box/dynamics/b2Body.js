(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2Body", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Body = function(bd, world) {
 			this.m_xf = new b2Transform();
 			this.m_sweep = new b2Sweep();
 			this.m_linearVelocity = new b2Vec2();
 			this.m_force = new b2Vec2();

 			this.init(bd,world);
 		};
 		(function() {
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
		      	//position
		      	this.m_xf.position.SetV(bd.position);
		      	//angle
		      	this.m_xf.R.Set(bd.angle);
		      	
		      	this.m_sweep.localCenter.SetZero();
		      	this.m_sweep.t0 = 1.0;
		      	this.m_sweep.a0 = this.m_sweep.a = bd.angle;

 			}
 		}).call(b2Body.prototype);
 		(function() {
 			this.b2_staticBody = 0;// 静态
 			this.b2_kinematicBody = 1;//动态物体
 			this.b2_dynamicBody = 2;//运动学物体

 		}).call(b2Body);
 		module.exports = b2Body;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
