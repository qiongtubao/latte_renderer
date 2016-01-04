(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/shapes/b2CircleShape", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Shape = require("./b2Shape")
   			, Vec2 = require("../../common/math/b2Vec2")
            , Settings = require("../../common/b2Settings")
   			, latte_lib = require("latte_lib");
   		/**
   			圆形
   			@module 类
   			@namespace collision.circleShape
   			@class CircleShape
			@param radius {Number} 半径
   		*/
   		var CircleShape = function(radius) {
   			Shape.apply(this, arguments);
   			this.m_p = new Vec2();
   			this.init(radius);
   		};
   		latte_lib.inherits(CircleShape, Shape);
   		(function() {
   			this.init = function(radius) {
   				if(radius === undefined) radius = 0;
   				Shape.call(this);
   				this.m_type = Shape.e_circleShape;
   				this.m_radius = radius;
   			}
   			this.Copy = function() {
   				var s = new CircleShape();
   				s.Set(this);
   				return s;
   			}
   			this.Set = function(other) {
   				Shape.prototype.Set.call(this, other);
   				if(other instanceof CircleShape) {
   					this.m_p.SetV(other.m_p);
   				}
   			}
   			/**
   				@method computeAABB
   				@param aabb {collision.computeAABB}
   				@param transform {collision.Transform}
   			*/
   			this.ComputeAABB = function(aabb, transform) {
   				var tMat = transform.R;
   				var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
   				var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
   				aabb.lowerBound.set(pX - this.m_radius, pY - this.m_radius);
   				aabb.upperBound.set(pX + this.m_radius, pY + this.m_radius);
   			}
            /**
               Fixture.GetMassData->
               @method computeMass
               @param massData {collision.shapes.massData}
               @param density {Int}
            */
            this.ComputeMass = function(massData, density) {
               if(density === undefined) density = 0;
               massData.mass = density * Settings.pi * this.m_radius * this.m_radius;
               massData.center.SetV(this.m_p);
               massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
            }


   		}).call(CircleShape.prototype);
   		module.exports = CircleShape;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );