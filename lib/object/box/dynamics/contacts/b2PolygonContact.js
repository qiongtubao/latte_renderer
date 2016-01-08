(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolygonContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2PolygonContact = function() {
 			b2Contact.call(this);
 		};
 		latte_lib.inherits(b2PolygonContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      b2Collision.CollidePolygons(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2PolygonShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2PolygonContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolygonContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolygonContact);
 		module.exports = b2PolygonContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
