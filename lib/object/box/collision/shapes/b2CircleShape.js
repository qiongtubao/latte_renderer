(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/shapes/b2CircleShape", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Shape = require("./b2Shape")
   			, Vec2 = require("../../common/math/b2Vec2")
            , Settings = require("../../common/b2Settings")
   			, latte_lib = require("latte_lib")
            , Box2D = require("../../index");
   		/**
   			圆形
   			@module 类
   			@namespace collision.circleShape
   			@class CircleShape
			@param radius {Number} 半径
   		*/
   		function b2CircleShape(radius) {
   			//Shape.apply(this, arguments);
   			this.m_p = new Vec2();
   			this.init(radius);
   		};
   		latte_lib.inherits(b2CircleShape, Shape);
   		(function() {
   			this.init = function(radius) {
   				if(radius === undefined) radius = 0;
   				Shape.prototype.init.call(this);
   				this.m_type = Shape.e_circleShape;
   				this.m_radius = radius;
   			}
   			this.Copy = function() {
   				var s = new b2CircleShape();
   				s.Set(this);
   				return s;
   			}
   			this.Set = function(other) {
   				Shape.prototype.Set.call(this, other);
   				if(Box2D.is(other, b2CircleShape)) {
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
   				aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
   				aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius);
   			}
            /**
               Fixture.GetMassData->
               @method computeMass
               @param massData {collision.shapes.massData}
               @param density {Int}
            */
            this.ComputeMass = function(massData, density) {
               if(density === undefined) density = 0;
               massData.mass = density * Settings.b2_pi * this.m_radius * this.m_radius;
               massData.center.SetV(this.m_p);
               massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
            }

            this.TestPoint = function(transform, p) {
                var tMat = transform.R;
               var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
               var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
               dX = p.x - dX;
               dY = p.y - dY;
               return (dX * dX + dY * dY) <= this.m_radius * this.m_radius;
            }
   		}).call(b2CircleShape.prototype);
   		module.exports = b2CircleShape;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );