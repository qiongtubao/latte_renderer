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
 			this.Step = function(dt, velocityIterations, positionIterations) {
 				debugger;
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
