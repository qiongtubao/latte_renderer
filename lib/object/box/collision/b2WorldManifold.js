(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2WorldManifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Vec2 = require("../common/math/b2Vec2")
   			, b2Settings = require("../common/b2Settings");
   		var b2WorldManifold = function() {
   			this.m_normal = new b2Vec2();
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
   				for(var i = 0;i < b2Settings.b2_maxManifoldPoints; i++) {
   					this.m_points[i] = new b2Vec2();
   				}
   			}
   		}).call(b2WorldManifold.prototype);
   		module.exports = b2WorldManifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );