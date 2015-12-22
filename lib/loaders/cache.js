(function(define) {'use strict'
	define("latte_renderer/loaders/textureLoader", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Cache = function() {};
 		(function() {
 			var self = this;
 			this.enabled = false;
 			this.files = {};
 			this.add = function(key, file) {
 				if(self.enabled === false) return ;
 				this.files[key] = file;
 			}
 			this.get = function(key) {
 				if(self.enabled === false) return ;
 				return this.files[key];
 			}

 			this.remove = function(key) {
 				delete self.files[key];
 			}
 			this.clear = function() {
 				self.files = {};
 			}
 		}).call(Cache);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
