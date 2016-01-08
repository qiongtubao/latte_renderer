(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2FilterData", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var defaultCategoryBits = 0x0001;
 		var b2FilterData = function() {
 			this.categoryBits = defaultCategoryBits;
 			this.maskBits = 0xFFFF;
 			this.groupIndex = 0;
 		};
 		(function() {
 			this.Copy = function() {
 				var clone = new b2FilterData();
 				clone.categoryBits = defaultCategoryBits;
 				clone.maskBits = this.maskBits;
 				clone.groupIndex = this.groupIndex;
 				return clone;
 			}
 		}).call(b2FilterData.prototype);
 		module.exports = b2FilterData;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
