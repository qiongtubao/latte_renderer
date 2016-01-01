(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2EdgeAndCircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2EdgeAndCircleContact = function() {
 			
 		};
 		latte_lib.inherits(b2EdgeAndCircleContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		     var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      this.b2CollideEdgeAndCircle(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2EdgeShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2EdgeAndCircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2EdgeAndCircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2EdgeAndCircleContact);
 		module.exports = b2EdgeAndCircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
