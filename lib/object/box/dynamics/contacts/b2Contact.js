(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2Contact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//基类
 		var b2ContactEdge = require("./b2ContactEdge")
 			, b2Manifold = require("../../collision/b2Manifold");
 		var b2Contact = function() {
 			this.m_nodeA = new b2ContactEdge();
 			this.m_nodeB = new b2ContactEdge();
 			this.m_manifold = new b2Manifold();
 			this.m_oldManifold = new b2Manifold();
 		};
 		(function() {
 			
 		}).call(b2Contact.prototype);
 		module.exports = b2Contact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
