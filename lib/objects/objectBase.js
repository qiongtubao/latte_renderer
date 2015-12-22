(function(define) {'use strict'
	define("latte_renderer/objects/objectBase", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var ObjectBase = function(options) {
 			this.attribute = options;
 			this.childers = {};
 			this.partner = null;
 			this.name = "";
 			this.type = "objectBase";
 			
 			this.visible = true;
 		};
 		latte_lib.inherits(ObjectBase, latte_lib.events);
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
 				if(latte_lib.isString(path)) {
 					path = path.split("/");					
 				}
 				var path = paths.shift();
 				if(!path) {
 					return this;
 				}
 				var result = [];
 				this.childers[path].forEach(function(childer) {
 					result = result.concat(childer.query(path));
 				});
 				return result;
 			}
 		}).call(ObjectBase.prototype);
 		module.exports = ObjectBase;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
