(function(define) { 'use strict';
   define("latte_renderer/object/box/index", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		(function() {
   			this.parseUInt = function(v) {
	   			return Math.abs(parseInt(v));
	   		}
	   		this.is = function(o1, o2) {
	   			if(o1 == null) { return false;}

	   			if((o2 instanceof Function) && (o1 instanceof o2)) return true;
	   			if ((o1.constructor.__implements != undefined) && (o1.constructor.__implements[o2])) return true;
      			return false;
	   		}
            this.NVector = function(length) {
                  if(length === undefined) length = 0;
                  var tmp = new Array(length || 0);
                  for(var i = 0; i < length; ++i) {
                     tmp[i] = 0;
                  }
                  return tmp;
            }
   		}).call(module.exports);
   		
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );