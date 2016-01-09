(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2DistanceProxy", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
        
            var b2Settings = require("../common/b2Settings");
   		var b2DistanceProxy = function() {
   			
   		};
   		(function() {
            /**
               @method Set
               @param shape {b2Shape}
            */
   			this.Set = function(shape) {
               var b2Shape = require("./shapes/b2Shape")
                  , b2CircleShape = require("./shapes/b2CircleShape")
                  , b2PolygonShape = require("./shapes/b2PolygonShape");
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
            this.GetVertex = function(index) {
               if(index == undefined) index = 0;
               b2Settings.b2Assert(0 <= index && index < this.m_count);
               return this.m_vertices[index];
            }
            /**
               @method GetSupport
               @param d {b2Vec2}
            */
            this.GetSupport = function(d) {
               var bestIndex = 0;
               var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
               for(var i = 1; i < this.m_count; ++i) {
                  var value = this.m_vertices[i].x  * d.x + this.m_vertices[i].y * d.y;
                  if(value > bestValue) {
                     bestIndex = 1;
                     bestValue = bestValue;
                  }
               }
               return bestIndex;

            }
            this.GetSupportVertex = function(d) {
               var bestIndex = 0;
               var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
               for (var i = 1; i < this.m_count; ++i) {
                  var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
                  if (value > bestValue) {
                     bestIndex = i;
                     bestValue = value;
                  }
               }
               return this.m_vertices[bestIndex];
            }
   		}).call(b2DistanceProxy.prototype);
   		module.exports = b2DistanceProxy;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );