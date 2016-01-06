(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/contacts/b2PositionSolveManifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2Vec2 = require("../../common/math/b2Vec2")
            , b2Box = require("../../index")
            , b2Settings = require("../../common/b2Settings");
   		var b2PositionSolveManifold = function() {
            
   		};
   		(function() {
   			this.init = function() {
               this.m_normal = new b2Vec2();
               this.m_separations = b2Box.NVector(b2Settings.b2_maxManifoldPoints);
               this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
               for(var i = 0; i < b2Settings.b2_maxManifoldPoints; i++) {
                  this.m_points[i] = new b2Vec2();
               }
            }
   		}).call(b2PositionSolveManifold.prototype);
         (function() {
            this.circlePointA = new b2Vec2();
            this.circlePointB = new b2Vec2();
         }).call(b2PositionSolveManifold);
   		module.exports = b2PositionSolveManifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );