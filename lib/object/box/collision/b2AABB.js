(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2AABB", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 			/**
   			@module 类
   			@namespace collision
   			@class AABB
   		*/
   		/**
   			上界
   			@property upperBound
   			@type {common.math.Vec2}
   		*/
   		/**
   			下界
			@property lowerBound
			@type {common.math.Vec2}
   		*/
   		var Vec2 = require("../common/math/b2Vec2");
   		var AABB = function() {
   			this.lowerBound = new Vec2();
      		this.upperBound = new Vec2();
   		};
   		(function() {
   			/**
   				求中心点
   				@method getCenter
   				@return {common.Vec2}
   			*/
   			this.GetCenter = function() {
   				return new Vec2((this.lowerBound.x + this.upperBound.x)/2 ,(this.lowerBound.y + this.upperBound.y)/2);
   			}
   			/**
   				结合
   				@method combine
   				@param aabb1 {collision.AABB}
   				@param aabb2 {collision.AABB}
   			*/
   			this.Combine = function(aabb1, aabb2) {
   				this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
   				this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
   				this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
   				this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
   			}
   			/**
   				判断是否包含
   				@method contains
   				@param aabb {collision.AABB}
   			*/
   			this.Contains = function(aabb) {
   				return 
	   				this.lowerBound.x <= aabb.lowerBound.x &&
	   				this.lowerBound.y <= aabb.lowerBound.y &&
	   				aabb.upperBound.x <= this.upperBound.x &&
	   				aabb.upperBound.y <= this.upperBound.y;
   			}
            /**
               是否重叠
               @method testOverlap
               @param other {collision.AABB}
            */
            this.TestOverlap = function(other) {
               var d1X = other.lowerBound.x - this.upperBound.x;
               var d1Y = other.lowerBound.y - this.upperBound.y;
               var d2X = this.lowerBound.x - other.upperBound.x;
               var d2Y = this.lowerBound.y - other.upperBound.y;
               if (d1X > 0.0 || d1Y > 0.0) return false;
               if (d2X > 0.0 || d2Y > 0.0) return false;
               return true;
            }
   		}).call(AABB.prototype);
		(function(){
			this.combine = function(aabb1, aabb2){
            var aabb = new AABB();
            aabb.combine(aabb1, aabb2);
            return aabb;
         }
		}).call(AABB);
		module.exports = AABB;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
