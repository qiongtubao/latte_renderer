(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2ContactID", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Features = require("./b2Features")
   		var ContactId = function() {
   			this.features = new Features();
            this.init();
         };
         (function() {
            this.init = function() {
            	this.features._m_id = this;
            }
         }).call(ContactId.prototype);
         module.exports = ContactId;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });