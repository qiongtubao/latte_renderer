(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2DistanceProxy", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var b2Shape = require("./shape/b2Shape")
            , b2Settings = require("../common/b2Settings");
   		var b2DistanceProxy = function() {
   			
   		};
   		(function() {
   			this.Set = function(shape) {
               switch(shape.GetType()) {
                  case b2Shape.e_circleShape:
                     var circle = (shape instanceof b2CircleShape? shape: null);
                     this.m_vertices = new Array(1,true);
                     this.m_vertices[0] = circle.m_p;
                     this.m_count = 1;
                     this.m_radius = circle.m_radius;
                  break;
                  case b2Shape.e_polygonShape:
                     var polygon = (shape instanceof b2PolygonShape? shape: null);
                     this.m_vertices = polygon.m_vertices;
                     this.m_count = 1;
                     this.m_radius = polygon.m_radius;
                  break;
                  default:
                     b2Settings.b2Assert(false);
                  break;
               }
            }
   		}).call(b2DistanceProxy.prototype);
   		module.exports = b2DistanceProxy;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );