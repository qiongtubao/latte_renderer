(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2CircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact")
 			, b2Collision = require("../../collision/b2Collision")
 			, b2CircleShape = require("../../collision/shapes/b2CircleShape");
 		var b2CircleContact = function() {
 			b2Contact.call(this);
 		};
 		latte_lib.inherits(b2CircleContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      b2Collision.CollideCircles(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2CircleShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2CircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2CircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2CircleContact);
 		module.exports = b2CircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
