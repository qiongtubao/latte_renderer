(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2Simplex", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		// b2Collision ->
   		var b2Vec2 = require("../common/math/b2Vec2")
   			, b2ContactID = require("./b2ContactID")
   			, b2SimplexVertex = require("./b2SimplexVertex")
            , b2Settings = require("../common/b2Settings")
            , b2Math = require("../common/math/b2Math")
            , Box2D = require("../index");
   		var b2Simplex = function() {
   			this.m_v1 = new b2SimplexVertex();
   			this.m_v2 = new b2SimplexVertex();
   			this.m_v3 = new b2SimplexVertex();
   			this.m_vertices = new Array(3);
            this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_vertices[0] = this.m_v1;
   				this.m_vertices[1] = this.m_v2;
   				this.m_vertices[2] = this.m_v3;
   			}
            /**
               b2Distance.Distance ->
               @param cache {b2SimplexCache}
               @param proxyA {b2DistanceProxy}
               @param transformA  {b2Transform}
               @param proxyB {b2DistanceProxy}
               @param transformB  {b2Transform}

            */
            this.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
               b2Settings.b2Assert(0<=cache.count && cache.count <= 3);
               var wALocal;
               var wBLocal;
               this.m_count = cache.count;
               var vertices = this.m_vertices;
               for (var i = 0; i < this.m_count; i++) {
                  var v = vertices[i];
                  v.indexA = cache.indexA[i];
                  v.indexB = cache.indexB[i];
                  wALocal = proxyA.GetVertex(v.indexA);
                  wBLocal = proxyB.GetVertex(v.indexB);
                  v.wA = b2Math.MulX(transformA, wALocal);
                  v.wB = b2Math.MulX(transformB, wBLocal);
                  v.w = b2Math.SubtractVV(v.wB, v.wA);
                  v.a = 0;
               }
               if (this.m_count > 1) {
                  var metric1 = cache.metric;
                  var metric2 = this.GetMetric();
                  if (metric2 < .5 * metric1 || 2.0 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
                     this.m_count = 0;
                  }
               }
               if (this.m_count == 0) {
                  v = vertices[0];
                  v.indexA = 0;
                  v.indexB = 0;
                  wALocal = proxyA.GetVertex(0);
                  wBLocal = proxyB.GetVertex(0);
                  v.wA = b2Math.MulX(transformA, wALocal);
                  v.wB = b2Math.MulX(transformB, wBLocal);
                  v.w = b2Math.SubtractVV(v.wB, v.wA);
                  this.m_count = 1;
               }
            }
            this.GetClosesPoint = function() {
               switch(this.m_count) {
                  case 0:
                     b2Settings.b2Assert(false);
                     return new b2Vec2();
                  break;
                  case 1:
                     return this.m_v1.w;
                  case 2:
                     return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
                  default:
                     b2Settings.b2Assert(false);
                     return new b2Vec2();
               }
            }
            this.GetSearchDirection = function() {
               switch(this.m_count) {
                  case 1:
                     return this.m_v1.w.GetNegative();
                  case 2:
                     {
                        var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
                        var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
                        if(sgn > 0.0) {
                           return b2Math.CrossFV(1.0, e12);
                        }else{
                           return b2Math.CrossVF(e12, 1.0);
                        }
                     }
                  default:
                     b2Settings.b2Assert(false);
                     return new b2Vec2();
               }
            }
            /**
               @method GetWitnessPoints
               @param pA {b2Vec2}
               @param pB {b2Vec2}
            */
            this.GetWitnessPoints = function(pA, pB) {
               switch(this.m_count) {
                  case 0:
                     b2Settings.b2Assert(false);
                  break;
                  case 1:
                     pA.SetV(this.m_v1.wA);
                     pB.SetV(this.m_v1.wB);
                  break;
                  case 2:
                     pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
                     pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
                     pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
                     pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;                  
                  break;
                  case 3:
                     pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
                     pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
                  break;
                  default:
                     b2Settings.b2Assert(false);
                  break;
               }
            }
            /**
               @method WriteCache
               @param cache {b2SimplexCache}
            */
            this.WriteCache = function(cache) {
               cache.metric = this.GetMetric();
               cache.count = Box2D.parseUInt(this.m_count);
               var vertices = this.m_vertices;
               for(var i = 0; i < this.m_count; i++) {
                  cache.indexA[i] = Box2D.parseUInt(vertices[i].indexA);
                  cache.indexB[i] = Box2D.parseUInt(vertices[i].indexB);
                }
            }
            this.GetMetric = function() {
               switch(this.m_count) {
                     case 0:
                        b2Settings.b2Assert(false);
                        return 0.0;
                     case 1:
                        return 0.0;
                     case 2:
                        return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
                     case 3:
                        return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
                     default:
                        b2Settings.b2Assert(false);
                        return 0.0;
               }
            }
   		}).call(b2Simplex.prototype);
   		module.exports = b2Simplex;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );