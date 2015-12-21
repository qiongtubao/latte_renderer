(function(define) {'use strict'
	define("latte_renderer/utils/map", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var HashMap = function() {
 			var keys = {};
 			var	values = {};

 		};
 		(function() {
 			this.push = function(key, value) {
 				var keyCode = HashMap.getCode(key);
 				var valuesCode = HashMap.getCode(value);
 				this.keys[valuesCode] = key;
 				this.values[keyCode] = value;
 			}
 			this.get = function(key) {
 				var keyCode = HashMap.getCode(key);
 				return this.values[keyCode];
 			}
 			this.getKey = function(value) {
 				var keyCode = HashMap.getCode(key);
 				return this.values[keyCode];
 			}
 		}).call(HashMap.prototype);
 		(function() {
 			var code = 0;
 			this.getCode = function(key) {
 				key.code = code++;
 				return key.code;
 			}
 		}).call(HashMap);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
