(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2Manifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Settings = require("../common/b2Settings")
   			, b2Vec2 = require("../common/math/b2Vec2")
            , b2ManifoldPoint = require("./b2ManifoldPoint");
   		var Manifold = function() {
   			this.m_pointCount = 0;
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_points = new Array(Settings.b2_maxManifoldPoints);
   				for(var i = 0; i < Settings.b2_maxManifoldPoints; i++) {
   					this.m_points[i] = new b2ManifoldPoint();
   				}
   				this.m_localPlaneNormal = new b2Vec2();
               this.m_localPoint = new b2Vec2();
   			}
   		}).call(Manifold.prototype);
         (function() {
            this.e_circles = 0x0001;
            this.e_faceA = 0x0002;
            this.e_faceB = 0x0004;
         }).call(Manifold);
   		module.exports = Manifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );