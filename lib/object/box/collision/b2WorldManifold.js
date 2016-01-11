(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2WorldManifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Vec2 = require("../common/math/b2Vec2")
   			, b2Settings = require("../common/b2Settings")
            , b2Manifold = require("./b2Manifold");
   		var b2WorldManifold = function() {
   			this.m_normal = new b2Vec2();
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
   				for(var i = 0;i < b2Settings.b2_maxManifoldPoints; i++) {
   					this.m_points[i] = new b2Vec2();
   				}
   			}
            this.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
               if(radiusA === undefined) radiusA = 0;
               if(radiusB === undefined) radiusB = 0;
               if (manifold.m_pointCount == 0) {
                  return;
               }
               var i = 0;
               var tVec;
               var tMat;
               var normalX = 0;
               var normalY = 0;
               var planePointX = 0;
               var planePointY = 0;
               var clipPointX = 0;
               var clipPointY = 0;
               switch (manifold.m_type) {
               case b2Manifold.e_circles:
                  {
                     tMat = xfA.R;
                     tVec = manifold.m_localPoint;
                     var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     tMat = xfB.R;
                     tVec = manifold.m_points[0].m_localPoint;
                     var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     var dX = pointBX - pointAX;
                     var dY = pointBY - pointAY;
                     var d2 = dX * dX + dY * dY;
                     if (d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
                        var d = Math.sqrt(d2);
                        this.m_normal.x = dX / d;
                        this.m_normal.y = dY / d;
                     }
                     else {
                        this.m_normal.x = 1;
                        this.m_normal.y = 0;
                     }
                     var cAX = pointAX + radiusA * this.m_normal.x;
                     var cAY = pointAY + radiusA * this.m_normal.y;
                     var cBX = pointBX - radiusB * this.m_normal.x;
                     var cBY = pointBY - radiusB * this.m_normal.y;
                     this.m_points[0].x = 0.5 * (cAX + cBX);
                     this.m_points[0].y = 0.5 * (cAY + cBY);
                  }
                  break;
               case b2Manifold.e_faceA:
                  {
                     tMat = xfA.R;
                     tVec = manifold.m_localPlaneNormal;
                     normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     tMat = xfA.R;
                     tVec = manifold.m_localPoint;
                     planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     this.m_normal.x = normalX;
                     this.m_normal.y = normalY;
                     for (i = 0;
                     i < manifold.m_pointCount; i++) {
                        tMat = xfB.R;
                        tVec = manifold.m_points[i].m_localPoint;
                        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
                        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY;
                     }
                  }
                  break;
               case b2Manifold.e_faceB:
                  {
                     tMat = xfB.R;
                     tVec = manifold.m_localPlaneNormal;
                     normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     tMat = xfB.R;
                     tVec = manifold.m_localPoint;
                     planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                     planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                     this.m_normal.x = (-normalX);
                     this.m_normal.y = (-normalY);
                     for (i = 0;
                     i < manifold.m_pointCount; i++) {
                        tMat = xfA.R;
                        tVec = manifold.m_points[i].m_localPoint;
                        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
                        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
                        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
                        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY;
                     }
                  }
                  break;
               }
            }
   		}).call(b2WorldManifold.prototype);
   		module.exports = b2WorldManifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );