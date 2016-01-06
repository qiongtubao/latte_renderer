(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2Contact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//基类
 		var b2ContactEdge = require("./b2ContactEdge")
 			, b2Manifold = require("../../collision/b2Manifold")
 			, b2TOIInput = require("../../collision/b2TOIInput");
 		var b2Contact = function() {
 			this.m_nodeA = new b2ContactEdge();
 			this.m_nodeB = new b2ContactEdge();
 			this.m_manifold = new b2Manifold();
 			this.m_oldManifold = new b2Manifold();
 		};
 		(function() {
 			
 		}).call(b2Contact.prototype);
 		(function() {
 			this.e_sensorFlag = 0x0001;
 			this.e_continuousFlag = 0x0002;
 			this.e_islandFlag = 0x0004;
 			this.e_toiFlag = 0x0008;
 			this.e_touchingFlag = 0x0010;
 			this.e_enabledFlag = 0x0020;
 			this.e_filterFlag = 0x0040;
 			this.s_input = new b2TOIInput();
 		}).call(b2Contact);
 		module.exports = b2Contact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
