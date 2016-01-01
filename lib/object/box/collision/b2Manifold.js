(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2Manifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Settings = require("../common/b2Settings")
   			, ManifoldPoint = require("./b2ManifoldPoint");
   		var Manifold = function() {
   			this.m_pointCount = 0;
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_points = new Array(Settings.maxManifoldPoints);
   				for(var i = 0; i < Settings.maxManifoldPoints; i++) {
   					this.m_points[i] = new ManifoldPoint();
   				}
   				this.m_localPlaneNormal = new Vec2();
   				this.m_localPoint = new Vec2();
   			}
   		}).call(Manifold.prototype);
   		module.exports = Manifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );