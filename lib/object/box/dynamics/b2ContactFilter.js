(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactFilter", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   	var b2ContactFilter = function() {

   	};
   	(function() {
         /**
            是否碰撞
            @method shouldCollide

         */
   		this.shouldCollide = function(fixtureA, fixtureB) {
            var filter1 = fixtureA.getFilterData();
            var filter2 = fixtureB.getFilterData();
            if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
               return filter1.groupIndex > 0;
            }
            return (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
            
         }
    	}).call(b2ContactFilter.prototype);
   	(function() {
   		this.defaultFilter = new b2ContactFilter();
   	}).call(b2ContactFilter);
   	module.exports = b2ContactFilter;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );