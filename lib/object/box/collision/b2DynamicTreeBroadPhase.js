(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTreeBroadPhase", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		 var DynamicTree = require("./b2DynamicTree")
            , DynamicTreePair = require("./b2DynamicTreePair");
         /**
            @module 类
            @namespace collision
            @class DynamicTreeBroadPhase
         */

         /**
            @property m_tree
            @type {collision.dynamicTree}
         */
         /**
            @property m_moveBuffer
            @type {Array}
         */
         /**
            @property m_pairBuffer
            @type {Array}
         */
         /**
            @property m_pairCount
            @type {Int}
         */
   		var b2DynamicTreeBroadPhase = function() {
   			this.m_tree = new DynamicTree();
   			this.m_moveBuffer = new Array();
   			this.m_pairBuffer = new Array();
   			this.m_pairCount = 0;
   		};
   		(function() {
            this.CreateProxy = function(aabb, userData) {
               var proxy = this.m_tree.CreateProxy(aabb, userData);
               ++this.m_proxyCount;
               this.BufferMove(proxy);
               return proxy;
            }
            this.BufferMove = function(proxy) {
               this.m_moveBuffer[this.m_moveBuffer.length] = proxy;
            }
            var latteWait = 0;
            this.UpdatePairs = function(callback) {
               var self = this;
               self.m_pairCount = 0;
               var i = 0
                  , queryProxy;
               
               for(i = 0; i < self.m_moveBuffer.length; ++i) {
                  queryProxy = self.m_moveBuffer[i];               
                  function QueryCallback(proxy) {
                     if(proxy == queryProxy) return true;
                     if(self.m_pairCount == self.m_pairBuffer.length) {
                        self.m_pairBuffer[self.m_pairCount] = new DynamicTreePair();
                     }
                     var pair = self.m_pairBuffer[self.m_pairCount];
                     pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
                     pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
                     ++self.m_pairCount;
                     return true;
                  };
                  var fatAABB = self.m_tree.getFatAABB(queryProxy);
                  self.m_tree.query(QueryCallback, fatAABB);
               }
               /**
               if(latteWait++) {
                  console.log(self.m_tree);
                  throw "test";
               }
                */
               self.m_moveBuffer.length = 0;
               for(var i = 0 ; i < self.m_pairCount;) {
                  var primaryPair = self.m_pairBuffer[i];
                  var userDataA = self.m_tree.GetUserData(primaryPair.proxyA);
                  var userDataB = self.m_tree.GetUserData(primaryPair.proxyB);
                  callback(userDataA, userDataB);
                  ++i;
                  while(i < self.m_pairCount) {
                     var pair = self.m_pairBuffer[i];
                     if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
                        break;
                     }
                     ++i;
                  }
               }
            }
            /**
               fixture.synchronize->

            */
            this.MoveProxy = function(proxy, aabb, displacement){
               
               var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
               if (buffer) {
                  this.BufferMove(proxy);
               }
            }

            this.TestOverlap = function(proxyA, proxyB) {
               var aabbA = this.m_tree.getFatAABB(proxyA);
               var aabbB = this.m_tree.getFatAABB(proxyB);
               return aabbA.TestOverlap(aabbB);
            }  
            this.Query = function(callback, aabb) {
               this.m_tree.Query(callback, aabb);
            }
            this.GetUserData = function(proxy) {
               return this.m_tree.GetUserData(proxy);
            }
   		}).call(b2DynamicTreeBroadPhase.prototype);
   		module.exports = b2DynamicTreeBroadPhase;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
