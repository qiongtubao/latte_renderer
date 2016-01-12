(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2ManifoldPoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		 var b2ContactId = require("./b2ContactID")
            , b2Vec2 = require("../common/math/b2Vec2")
            , b2Settings = require("../common/b2Settings");
   		var ManifoldPoint = function() {
            this.m_localPoint = new b2Vec2();
            this.m_id = new b2ContactId();
            this.init();
   		};
   		(function() {
   			this.init = this.Reset = function() {
               this.m_localPoint.SetZero();
               this.m_normalImpulse = 0.0;
               this.m_tangentImpulse = 0.0;
               this.m_id.key = 0;
            }
   		}).call(ManifoldPoint.prototype);
   		module.exports = ManifoldPoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );