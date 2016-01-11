(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2ManifoldPoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		 var b2ContactId = require("./b2ContactID")
            , b2Vec2 = require("../common/math/b2Vec2");
   		var ManifoldPoint = function() {
            this.m_localPoint = new b2Vec2();
            this.m_id = new b2ContactId();
            this.init();
   		};
   		(function() {
   			this.init = function() {
               this.m_points = new Vector(b2Settings.b2_maxManifoldPoints);
               for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
                  this.m_points[i] = new b2ManifoldPoint();
               }
               this.m_localPlaneNormal = new b2Vec2();
               this.m_localPoint = new b2Vec2();
            }
   		}).call(ManifoldPoint.prototype);
   		module.exports = ManifoldPoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );