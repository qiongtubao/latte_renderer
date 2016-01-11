(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2Fixture", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var AABB = require("../collision/b2AABB")
            , MassData = require("../collision/shapes/b2MassData")
            , mMath = require("../common/math/b2Math");
   		/**
   			@module 类
   			@namespace dynamics
   			@class Fixture
   		*/
   		var FilterData = require("./b2FilterData");
   		/**
   			@property m_filter
   			@type {dynamics.filterData}
   		*/
         /**
            @property m_shape
            @type {collision.shapes.Shape}

         */
         /**
            @property m_body
            @type {dynamics.Body}
         */
   		var Fixture = function() {
   			this.m_filter = new FilterData();
            this.init();
         };
   		(function() {
            this.init = function() {
               this.m_aabb = new AABB();
               this.m_userData = null;
               this.m_body = null;
               this.m_next = null;
               this.m_shape = null;
               this.m_density = 0.0;
               this.m_friction = 0.0;
               this.m_restitution = 0.0;
            }
   			/**
   				#body->createFixture 
   				@method create
   				@param body {dynamics.Body}
   				@param xf {common.math.transform}
   				@param def {dynamics.fixtureDef}
   			*/
   			this.Create = function(body, xf, def) {
   				this.m_userData = def.userData;
   				this.m_friction =  def.friction;
   				this.m_restitution = def.restitution;
   				this.m_body = body;
   				this.m_next = null;
   				this.m_filter = def.filter.Copy();
   				this.m_isSensor = def.IsSensor;
   				this.m_shape = def.shape.Copy();
   				this.m_density = def.density;
   			}
   			/**
   				#body->createProxy
   				@method createProxy
   				@param  broadPhase {collision.DdynamicTreeBroadPhase}
   				@param  xf {common.math.Ttransform}
   			*/
   			this.CreateProxy = function(broadPhase, xf) {
   				this.m_shape.ComputeAABB(this.m_aabb, xf);
   				this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this);
   			}

            this.GetMassData = function(massData) {
               if(massData === undefined) massData = null;
               if(massData == null) {
                  massData = new MassData();
               }
               this.m_shape.ComputeMass(massData, this.m_density);
               return massData;
            }
            /**
            */
            this.GetBody = function() {
               return this.m_body;
            }
            /**
               同步 world.solve->
               @method synchronize 

            */
            this.Synchronize = function(broadPhase, transform1, transform2) {
               if (!this.m_proxy) return;
               var aabb1 = new AABB();
               var aabb2 = new AABB();
               this.m_shape.ComputeAABB(aabb1, transform1);
               this.m_shape.ComputeAABB(aabb2, transform2);
               this.m_aabb.Combine(aabb1, aabb2);
               var displacement = mMath.SubtractVV(transform2.position, transform1.position);
               broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement);
            }

            this.GetShape = function() {
               return this.m_shape;
            }

            this.GetFilterData = function(){
               return this.m_filter.Copy();
            }
            /**
               获得类型
               @method getType 

            */
            this.GetType = function() {
               return this.m_shape.GetType();
            }

            this.IsSensor = function() {
               return this.m_isSensor;
            }

            this.GetFriction = function() {
               return this.m_friction;
            }
            this.GetRestitution = function() {
               return this.m_restitution;
            }
   		}).call(Fixture.prototype);
        module.exports = Fixture;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );