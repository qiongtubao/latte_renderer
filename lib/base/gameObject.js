(function(define) {'use strict'
	define("latte_renderer/renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var GameObject = function(options) {
 			this.attribute = options;
 			this.childers = {};
 			this.partner = null;
 			this.name = "";
 		};
 		(function() {
 			this.getPath = function(root) {
 				if(this.partner == null) { return ""; }
 				var partner = this.partner;
 				var path = this.name;
 				//????如果child 名一样怎么办?
 				while(partner != root) {
 					path = partner.name + "/" + path;
 					partner = partner.partner;
 				}
 				return path;
 			}
 			this.addChild = function(child) {
 				this.childers[child.name] = this.childers[child.name] || [];
 				this.childers[child.name].push(child);
 				child.partner = this;
 			}
 			this.setAttribute = function(key, value) {
 				this.attribute[key] = value;
 			}
 			this.removeChilde = function(child) {
 				var index = this.childers[child.name].indexOf(child);
 				latte_lib.removeArray(this.childers[child.name], index);
 				child.partner = null;
 			}
 			this.query = function(path) {
 				this.childers.query();
 			}
 		}).call(GameObject.prototype);
 		module.exports = GameObject;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
