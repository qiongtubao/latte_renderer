(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolyAndCircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 		, b2Contact = require("./b2Contact")
 		, b2Settings = require("../../common/b2Settings")
 		, b2Shape = require("../../collision/shapes/b2Shape")
 		, b2Collision = require("../../collision/b2Collision")
 		, b2PolygonShape = require("../../collision/shapes/b2PolygonShape")
 		, b2CircleShape = require("../../collision/shapes/b2CircleShape");
 		var b2PolyAndCircleContact = function() {
 			b2Contact.call(this);
 		};
 		latte_lib.inherits(b2PolyAndCircleContact, b2Contact);
 		(function() {
 			this.Reset = function(fixtureA, fixtureB) {
 				b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
 				b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
 				b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape);
 			}
 			/**
 				矩形和圆的碰撞
 				fixtureA.m_body 矩形
 				fixtureB.m_body 圆
 			*/
 			this.Evaluate = function () {
	      		var bA = this.m_fixtureA.m_body;
		      	var bB = this.m_fixtureB.m_body;
		      	b2Collision.CollidePolygonAndCircle(
		      		this.m_manifold, 
		      		(this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null),
		      		 bA.m_xf,
		      		 (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), 
		      		 bB.m_xf
		      	);
		   	}
 		}).call(b2PolyAndCircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolyAndCircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolyAndCircleContact);
 		module.exports = b2PolyAndCircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
