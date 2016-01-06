(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2Simplex", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		// b2Collision ->
   		var b2Vec2 = require("../common/math/b2Vec2")
   			, b2ContactID = require("./b2ContactID")
   			, b2SimplexVertex = require("./b2SimplexVertex");
   		var b2Simplex = function() {
   			this.m_v1 = new b2SimplexVertex();
   			this.m_v2 = new b2SimplexVertex();
   			this.m_v3 = new b2SimplexVertex();
   			this.m_vertices = new Array(3);
   		};
   		(function() {
   			this.init = function() {
   				this.m_vertices[0] = this.m_v1;
   				this.m_vertices[1] = this.m_v2;
   				this.m_vertices[2] = this.m_v3;
   			}
   		}).call(b2Simplex.prototype);
   		module.exports = b2Simplex;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );