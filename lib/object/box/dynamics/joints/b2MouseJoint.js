(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2MouseJoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Mat22 = require("../../common/math/b2Mat22")
   			, b2Vec2 = require("../../common/math/b2Vec2")
   			, b2Joint = require("./b2Joint")
   			, latte_lib = require("latte_lib");
   		var b2MouseJoint = function(def) {
            b2Joint.apply(this, arguments);
            this.K = new b2Mat22();
            this.K1 = new b2Mat22();
            this.K2 = new b2Mat22();
            this.m_localAnchor = new b2Vec2();
            this.m_target = new b2Vec2();
            this.m_mass = new b2Mat22();
            this.m_impulse = new b2Vec2();
            this.m_C = new b2Vec2();
            this.init(def);
   		};
         latte_lib.inherits(b2MouseJoint, b2Joint);
   		(function() {
   			//b2World.DrawJoint->
   			this.GetAnchorA = function(){
   				return this.m_target;
   			}
   			//b2World.DrawJoint->
   			this.GetAnchorB = function () {
      			return this.m_bodyB.GetWorldPoint(this.m_localAnchor);
			}
    		this.init = function(def) {
               b2Joint.prototype.init.apply(this, arguments);
               this.m_target.SetV(def.target);
			      var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
			      var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
			      var tMat = this.m_bodyB.m_xf.R;
			      this.m_localAnchor.x = (tX * tMat.col1.x + tY * tMat.col1.y);
			      this.m_localAnchor.y = (tX * tMat.col2.x + tY * tMat.col2.y);
			      this.m_maxForce = def.maxForce;
			      this.m_impulse.SetZero();
			      this.m_frequencyHz = def.frequencyHz;
			      this.m_dampingRatio = def.dampingRatio;
			      this.m_beta = 0.0;
			      this.m_gamma = 0.0;
            }
            this.SetTarget = function(target) {
            	if(this.m_bodyB.IsAwake() == false) {
            		this.m_bodyB.SetAwake(true);
   				}
   				this.m_target = target;
            }
            this.InitVelocityConstraints = function(step) {
            	var b = this.m_bodyB;
			      var mass = b.GetMass();
			      var omega = 2.0 * Math.PI * this.m_frequencyHz;
			      var d = 2.0 * mass * this.m_dampingRatio * omega;
			      var k = mass * omega * omega;
			      this.m_gamma = step.dt * (d + step.dt * k);
			      this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0.0;
			      this.m_beta = step.dt * k * this.m_gamma;
			      var tMat;tMat = b.m_xf.R;
			      var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
			      var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
			      var tX = (tMat.col1.x * rX + tMat.col2.x * rY);rY = (tMat.col1.y * rX + tMat.col2.y * rY);
			      rX = tX;
			      var invMass = b.m_invMass;
			      var invI = b.m_invI;this.K1.col1.x = invMass;
			      this.K1.col2.x = 0.0;
			      this.K1.col1.y = 0.0;
			      this.K1.col2.y = invMass;
			      this.K2.col1.x = invI * rY * rY;
			      this.K2.col2.x = (-invI * rX * rY);
			      this.K2.col1.y = (-invI * rX * rY);
			      this.K2.col2.y = invI * rX * rX;
			      this.K.SetM(this.K1);
			      this.K.AddM(this.K2);
			      this.K.col1.x += this.m_gamma;
			      this.K.col2.y += this.m_gamma;
			      this.K.GetInverse(this.m_mass);
			      this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
			      this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
			      b.m_angularVelocity *= 0.98;
			      this.m_impulse.x *= step.dtRatio;
			      this.m_impulse.y *= step.dtRatio;
			      b.m_linearVelocity.x += invMass * this.m_impulse.x;
			      b.m_linearVelocity.y += invMass * this.m_impulse.y;
			      b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x);
            }
            this.SolveVelocityConstraints = function(step) {
            	var b = this.m_bodyB;
			      var tMat;
			      var tX = 0;
			      var tY = 0;
			      tMat = b.m_xf.R;
			      var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
			      var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
			      tX = (tMat.col1.x * rX + tMat.col2.x * rY);
			      rY = (tMat.col1.y * rX + tMat.col2.y * rY);
			      rX = tX;
			      var CdotX = b.m_linearVelocity.x + ((-b.m_angularVelocity * rY));
			      var CdotY = b.m_linearVelocity.y + (b.m_angularVelocity * rX);
			      tMat = this.m_mass;
			      tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
			      tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
			      var impulseX = (-(tMat.col1.x * tX + tMat.col2.x * tY));
			      var impulseY = (-(tMat.col1.y * tX + tMat.col2.y * tY));
			      var oldImpulseX = this.m_impulse.x;
			      var oldImpulseY = this.m_impulse.y;
			      this.m_impulse.x += impulseX;
			      this.m_impulse.y += impulseY;
			      var maxImpulse = step.dt * this.m_maxForce;
			      if (this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
			         this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length());
			      }
			      impulseX = this.m_impulse.x - oldImpulseX;
			      impulseY = this.m_impulse.y - oldImpulseY;
			      b.m_linearVelocity.x += b.m_invMass * impulseX;
			      b.m_linearVelocity.y += b.m_invMass * impulseY;
			      b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX);
            }
            this.SolvePositionConstraints = function(baumgarte) {
            	if (baumgarte === undefined) baumgarte = 0;
      			return true;
            }
   		}).call(b2MouseJoint.prototype);
         (function() {
            
         }).call(b2MouseJoint);
   		module.exports = b2MouseJoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );