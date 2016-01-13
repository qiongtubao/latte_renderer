(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTreeNode", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var AABB = require("./b2AABB");
   		var DynamicTreeNode = function() {
   			this.aabb = new AABB();
   		};
   		(function() {
   			/**
   				判断是否树叶
   				@method isLeaf
   				@return {Boolean}
   			*/
   			this.IsLeaf = function() {
   				return this.child1 == null;
   			}
   		}).call(DynamicTreeNode.prototype);
   		module.exports = DynamicTreeNode;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
