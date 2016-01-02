(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2ManifoldPoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		 var ContactId = require("./b2ContactID");
   		var ManifoldPoint = function() {
            this.m_localPoint = new Vec2();
            this.m_id = new ContactId();
   		};
   		(function() {
   			
   		}).call(ManifoldPoint.prototype);
   		module.exports = ManifoldPoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );