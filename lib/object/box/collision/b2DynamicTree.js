(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTree", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Settings = require("../common/b2Settings")
            , DynamicTreeNode = require("./b2DynamicTreeNode")
            , AABB = require("./b2AABB");
            /**
               空闲的节点
               @property m_freeList
               @type {[]collision.DynamicTreeNode}
            */
            /**
               根节点
               @property m_root
               @type {collision.DynamicTreeNode}
            */
            /**
               插入节点个数
               @property m_insertionCount
               @type {Int}
            */
   		var DynamicTree = function() {
            this.init();
         };
         (function() {
            this.init = function() {
               this.m_root = null;
               this.m_freeList = null;
               this.m_path = 0;
               this.m_insertionCount = 0;
            }
            this.CreateProxy = function(aabb, userData) {
               var node = this.allocateNode();
               var extendX = Settings.aabbExtension;
               var extendY = Settings.aabbExtension;
               node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
               node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
               node.aabb.upperBound.x = aabb.upperBound.x + extendX;
               node.aabb.upperBound.y = aabb.upperBound.y + extendY;
               node.userData = userData;
               this.insertLeaf(node);
               return node;
            }

            /**
               分配节点
               @allocateNode
               @return node {collision.DynamicTreeNode}
            */
            this.allocateNode = function() {
               if(this.m_freeList) {
                  var node = this.m_freeList;
                  this.m_freeList = node.parent;
                  node.parent = null;
                  node.child1 = null;
                  node.child2 = null;
                  return node;
               }
               return new DynamicTreeNode();
            }
            /**
               插入树叶
               @method insertLeaf
               @param node {collision.DynamicTreeNode}
            */
            this.insertLeaf = function(leaf) {
               //插入树叶个数增加
               ++this.m_insertionCount;
               if(this.m_root == null) {
                  //没有根节点的话  就成为根节点
                  this.m_root = leaf;
                  this.m_root.parent = null;
                  return;
               }
               var center = leaf.aabb.GetCenter();
               var sibling = this.m_root;
               if(sibling.isLeaf() == false) {
                  do {
                     var child1 = sibling.child1;
                     var child2 = sibling.child2;
                     var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
                     var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
                     if(norm1 < norm2) {
                        sibling = child1;
                     }else{
                        sibling = child2;
                     }
                  }while (sibling.isLeaf() == false);
               }
            
               var node1 = sibling.parent;
               var node2 = this.allocateNode();
               node2.parent = node1;
               node2.userData = null;
               node2.aabb.Combine(leaf.aabb, sibling.aabb);
               if(node1) {
                  if(sibling.parent.child1 == sibling) {
                     node1.child1 = node2;
                  }else{
                     node1.child2 = node2;
                  }
                  node2.child1 = sibling;
                  node2.child2 = leaf;
                  sibling.parent = node2;
                  leaf.parent = node2;
                  do {
                     if(node1.aabb.Contains(node2.aabb)) { break;}
                        node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
                        node2 = node1;
                        node1 = node1.parent;
                  } while(node1) 
               }else{
                  node2.child1 = sibling;
                  node2.child2 = leaf;
                  sibling.parent = node2;
                  leaf.parent = node2;
                  this.m_root = node2;
               }
            }

            this.getFatAABB = function(proxy) {
               return proxy.aabb;
            }

            this.query = function(callback, aabb) {
               if(this.m_root == null) return;
               var stack = new Array();
               var count = 0;
               stack[count++] = this.m_root;
               while(count > 0) {
                  var node = stack[--count];
                  if(node.aabb.TestOverlap(aabb)) {
                     if(node.isLeaf()) {
                        var proceed = callback(node);
                        if(!proceed) return;
                     }else{
                        stack[count++] = node.child1;
                        stack[count++] = node.child2;
                     }
                  
                  }
               }
            }

            this.getUserData = function(proxy) {
               return proxy.userData;
            }
            /**
               dynamicTreeBroadPhase.moveProxy
            */
            this.MoveProxy = function(proxy, aabb, displacement) {
               Settings.b2Assert(proxy.isLeaf());
               if (proxy.aabb.Contains(aabb)) {
                  return false;
               }
               this.removeLeaf(proxy);
               var extendX = Settings.aabbExtension + Settings.aabbMultiplier * (displacement.x > 0 ? displacement.x : (-displacement.x));
               var extendY = Settings.aabbExtension + Settings.aabbMultiplier * (displacement.y > 0 ? displacement.y : (-displacement.y));
               proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
               proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
               proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
               proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
               this.insertLeaf(proxy);
               return true;
            }
            /**   
               删除叶子
               @method removeLeaf
            */
            this.removeLeaf = function(leaf) {
               if (leaf == this.m_root) {
                  this.m_root = null;
                  return;
               }
               var node2 = leaf.parent;
               var node1 = node2.parent;
               var sibling;
               if (node2.child1 == leaf) {
                  sibling = node2.child2;
               }
               else {
                  sibling = node2.child1;
               }
               if (node1) {
                  if (node1.child1 == node2) {
                     node1.child1 = sibling;
                  }
                  else {
                     node1.child2 = sibling;
                  }
                  sibling.parent = node1;
                  this.freeNode(node2);
                  while (node1) {
                     var oldAABB = node1.aabb;
                     node1.aabb = AABB.Combine(node1.child1.aabb, node1.child2.aabb);
                     if (oldAABB.Contains(node1.aabb)) break;
                     node1 = node1.parent;
                  }
               }
               else {
                  this.m_root = sibling;
                  sibling.parent = null;
                  this.freeNode(node2);
               }
            }

            this.freeNode = function(node) {
               node.parent = this.m_freeList;
               this.m_freeList = node;
            }
         }).call(DynamicTree.prototype);
         module.exports = DynamicTree;
   
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
