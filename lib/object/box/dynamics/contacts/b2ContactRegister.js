(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactRegister", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2ContactRegister = function() {
 			
 		};
 		
 		module.exports = b2ContactRegister;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
