(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2BodyDef", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../common/math/b2Vec2")
 			, b2Body = require("./b2Body");
 		var b2BodyDef = function() {
 			this.position = new b2Vec2();
 			this.linearVelocity = new b2Vec2();
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.userData = null;
 				this.position.Set(0.0,0.0);
 				this.angle = 0.0;
 				this.linearVelocity.Set(0,0);
 				this.angularDamping = 0.0;
 				this.allowSleep = true;
 				this.awake = true;
 				this.fixedRotation = false;
 				this.bullet = false;
 				this.type = b2Body.b2_staticBody;
 				this.active = true;
 				this.inertiaScale = 1.0;
 			}
 		}).call(b2BodyDef.prototype);
 		module.exports = b2BodyDef;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
