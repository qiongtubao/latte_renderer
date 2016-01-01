(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/contacts/b2ContactFactory", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
      var b2Shape = require("../../collision/shapes/b2Shape")
         , b2CircleContact = require("./b2CircleContact")
         , b2ContactRegister = require("./b2ContactRegister")
         , b2PolyAndCircleContact = require("./b2PolyAndCircleContact")
         , b2PolygonContact = require("./b2PolygonContact")
         , b2EdgeAndCircleContact = require("./b2EdgeAndCircleContact")
         , b2PolyAndEdgeContact = require("./b2PolyAndEdgeContact");
   	var b2ContactFactory = function(allocator) {
   		this.init(allocator);
   	};
   	(function() {
   		this.init = function(allocator) {
   			this.m_allocator = allocator;
   			this.InitializeRegisters();
   		}
         /**
            是否碰撞
            @method shouldCollide

         */
   			this.AddType = function(createFcn, destroyFcn, type1, type2) {
	            if (type1 === undefined) type1 = 0;
		      	if (type2 === undefined) type2 = 0;
		      	this.m_registers[type1][type2].createFcn = createFcn;
		      	this.m_registers[type1][type2].destroyFcn = destroyFcn;
		      	this.m_registers[type1][type2].primary = true;
		      	if (type1 != type2) {
			         this.m_registers[type2][type1].createFcn = createFcn;
			         this.m_registers[type2][type1].destroyFcn = destroyFcn;
			         this.m_registers[type2][type1].primary = false;
		      	}
         	}
         	this.Create  = function(fixtureA, fixtureB) {
         		var type1 = parseInt(fixtureA.GetType());
         		var type2 = parseInt(fixtureB.GetType());
         		var reg = this.m_registers[typ1][type2];
         		var c;
         		if(reg.pool) {
         			c = reg.pool;
         			reg.pool = c.m_next;
         			reg.poolCount--;
         			c.Reset(fixtureA, fixtureB);
         			return c;
         		}
         		var createFcn = reg.createFcn;
         		if(createFcn != null) {
         			if(reg.primary) {
         				c = createFcn(this.m_allocator);
         				c.Reset(fixtureA, fixtureB);
         				return c;
         			}else{
         				c = createFcn(this.m_allocator);
         				c.Reset(fixtureB, fixtureA);
         				return c;
         			}
         		}else{
         			return null;
         		}
         	}
         	this.InitializeRegisters = function () {
			      this.m_registers = new Array(b2Shape.e_shapeTypeCount);
			      for (var i = 0; i < b2Shape.e_shapeTypeCount; i++) {
			         this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
			         for (var j = 0; j < b2Shape.e_shapeTypeCount; j++) {
			            this.m_registers[i][j] = new b2ContactRegister();
			         }
			      }
			      this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
			      this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
			      this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
			      this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
			      this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape);
		   	}
		   	this.Destroy = function(contact) {
		   		if(contact.m_manifold.m_pointCount > 0) {
		   			contact.m_fixtureA.m_body.SetAwake(true);
		   			contact.m_fixtureB.m_body.SetAwake(true);
		   		}
		   		var type1 = parseInt(contact.m_fixtureA.GetType());
		   		var type2 = parseInt(contact.m_fixtureB.GetType());
		   		var reg = this.m_registers[type1][type2];
		   		if(true) {
		   			reg.poolCount++;
		   			contact.m_next = reg.pool;
		   			reg.pool = contact;
		   		}
		   		var destroyFcn = reg.destroyFcn;
		   		destroyFcn(contact, this.m_allocator);
		   	}
    	}).call(b2ContactFactory.prototype);
   	(function() {
   		
   	}).call(b2ContactFactory);
   	module.exports = b2ContactFactory;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );