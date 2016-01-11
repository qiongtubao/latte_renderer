(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactManager", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var contactFilter = require("./b2ContactFilter")
   			, contactListener = require("./b2ContactListener")
   			, contactFactory = require("./contacts/b2ContactFactory")
   			, dynamicTreeBroadPhase = require("../collision/b2DynamicTreeBroadPhase")
            , Fixture = require("./b2Fixture")
            , Contact = require("./contacts/b2Contact")
            , b2ContactPoint = require("../collision/b2ContactPoint");
            /**
               @module 类
               @namespace dynamics
               @class b2ContactManager
            */

            /**
               @property m_broadPhase
               @type {collision.dynamicTreeBroadPhase}
            */
            /**
               @property m_contactFactory
               @type {dynamics.contacts.contactFactory}
            */
   		var b2ContactManager = function() {
   			this.init();
   		};
   		(function(){
   			this.init = function() {
   				this.m_world = null;
   				this.m_contactCount = 0;
   				this.m_contactFilter = contactFilter.defaultFilter;
   				this.m_contactListener = contactListener.defaultListener;
   				this.m_contactFactory = new contactFactory(this.m_allocator);
   				this.m_broadPhase = new dynamicTreeBroadPhase();
   			}
            /**
               更新碰撞 
               @method collide
            */
            this.Collide = function() {
               var c = this.m_world.m_contactList;
               while(c) {
                  var fixtureA = c.GetFixtureA();
                  var fixtureB = c.GetFixtureB();
                  var bodyA = fixtureA.GetBody();
                  var bodyB = fixtureB.GetBody();
                  if(bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
                     c = c.GetNext();
                     continue;
                  }
                  if(c.m_flags & Contact.e_filterFlag) {
                     if(bodyB.ShouldCollide(bodyA) == false) {
                        var cNuke = c;
                        c = cNuke.GetNext();
                        this.destroy(cNuke);
                        continue;
                     }
                     if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
                        cNuke = c;
                        c = cNuke.GetNext();
                        this.destroy(cNuke);
                        continue;
                     }
                     c.m_flags &= ~Contact.e_filterFlag;
                  }
                  var proxyA = fixtureA.m_proxy;
                  var proxyB = fixtureB.m_proxy;
                  var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
                  if(overlap == false) {
                     cNuke = c;
                     c = cNuke.GetNext();
                     this.destroy(cNuke);
                     continue;
                  }
                  
                  c.Update(this.m_contactListener);
                  c = c.GetNext();
               }
            }
            /**

            */
            this.FindNewContacts = function() {
               var self = this;
               this.m_broadPhase.UpdatePairs(function () {
                  self.AddPair.apply(self, arguments);
               });
               //this.m_broadPhase.updatePairs(this.addPair.bind(this));
            }
            /**

            */
            this.AddPair = function(proxyUserDataA, proxyUserDataB) {
               var fixtureA = (proxyUserDataA instanceof Fixture ? proxyUserDataA : null);
               var fixtureB = (proxyUserDataB instanceof Fixture ? proxyUserDataB : null);
               var bodyA = fixtureA.GetBody();
               var bodyB = fixtureB.GetBody();
               if(bodyA == bodyB) return;
               var edge = bodyB.GetContactList();
               while(edge) {
                  if(edge.other == bodyA) {
                     var fA = edge.contact.GetFixtureA();
                     var fB = edge.contact.GetFixtureB();
                     if(fA == fixtureA && fB == fixtureB) return;
                     if(fA == fixtureB && fB == fixtureA) return;
                  }
                  edge = edge.next;
               }
               if(bodyB.ShouldCollide(bodyA) == false) {
                  return;
               }
               if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
                  return;
               }

               var c = this.m_contactFactory.Create(fixtureA, fixtureB);
               fixtureA = c.GetFixtureA();
               fixtureB = c.GetFixtureB();
               bodyA = fixtureA.m_body;
               bodyB = fixtureB.m_body;
               c.m_prev = null;
               c.m_next = this.m_world.m_contactList;
               if(this.m_world.m_contactList != null) {
                  this.m_world.m_contactList.m_prev = c;
               }
               this.m_world.m_contactList = c;
               c.m_nodeA.contact = c;
               c.m_nodeA.other = bodyB;
               c.m_nodeA.prev = null;
               c.m_nodeA.next = bodyA.m_contactList;
               if(bodyA.m_contactList != null) {
                  bodyA.m_contactList.prev = c.m_nodeA;
               }
               bodyA.m_contactList = c.m_nodeA;
               c.m_nodeB.contact = c;
               c.m_nodeB.other = bodyA;
               c.m_nodeB.prev = null;
               c.m_nodeB.next = bodyB.m_contactList;
               if(bodyB.m_contactList != null) {
                  bodyB.m_contactList.prev = c.m_nodeB;
               }
               bodyB.m_contactList = c.m_nodeB;
               ++this.m_world.m_contactCount;
               return;
            }

   		}).call(b2ContactManager.prototype);
         (function(){
            this.s_evalCP = new b2ContactPoint();
         }).call(b2ContactManager);
   		module.exports = b2ContactManager;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );