(function(define) {'use strict'
	define("latte_renderer/utils/hashMap", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib");
 		var HashMap = function() {
 			this.keys = {};
 			this.values = {};
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
 				if(latte_lib.isString(key)) {
 					return key;
 				}
 				if(key.code) {
 					return key.code;
 				}
 				key.code = code++;
 				return key.code;
 			}
 		}).call(HashMap);
 		module.exports = HashMap;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
