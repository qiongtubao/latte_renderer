(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/joints/b2RevoluteJoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var b2Joint = require("./b2Joint")
            , latte_lib = require("latte_lib");
   		var b2RevoluteJoint = function() {
                throw new "no ";
   		};
         latte_lib.inherits(b2RevoluteJoint, b2Joint);
   		(function() {
   			
   		}).call(b2RevoluteJoint.prototype);
         (function() {
            this.tImpulse = new b2Vec2();
         }).call(b2RevoluteJoint);
   		module.exports = b2RevoluteJoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );