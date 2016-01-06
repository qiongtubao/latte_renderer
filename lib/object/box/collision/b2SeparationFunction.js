(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2SeparationFunction", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Vec2 = require("../common/math/b2Vec2");
   		var b2SeparationFunction = function() {
   			this.m_localPoint = new b2Vec2();
   			this.m_axis = new b2Vec2();
   		};
   		(function() {
   			
   		}).call(b2SeparationFunction.prototype);
   		(function() {
   			this.e_points = 0x01;
   			this.e_faceA = 0x02;
   			this.e_faceB = 0x04;
   		}).call(b2SeparationFunction);
   		module.exports = b2SeparationFunction;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );