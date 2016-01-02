(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolyAndEdgeContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2PolyAndEdgeContact = function() {
 			
 		};
 		latte_lib.inherits(b2PolyAndEdgeContact, b2Contact);
 		(function() {
 			this.Reset = function (fixtureA, fixtureB) {
		      this.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
		      b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
		      b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape);
		   }
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      this.b2CollidePolyAndEdge(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2EdgeShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
		   this.b2CollidePolyAndEdge = function (manifold, polygon, xf1, edge, xf2) {}
 		}).call(b2PolyAndEdgeContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolyAndEdgeContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolyAndEdgeContact);
 		module.exports = b2PolyAndEdgeContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
