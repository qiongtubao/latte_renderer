(function(define) {'use strict'
	define("latte_renderer/object/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, Transform = require("./transform")
 			, Collision = require("./collision");
 		var ObjectBase = function(name, transform, options) {
 			this.attribute = options || {};
 			this.childers = {};
 			this.partner = null;
 			this.name = name;
 			this.type = "object";
 			this.visible = true;
 			this.transform = Transform.create(transform);
 			this.collision = Collision.create(transform);
 			this.events = new latte_lib.events();
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
 			this.query = function(paths) {
 				if(latte_lib.isString(paths)) {
 					paths = paths.split("/");					
 				}
 				var path = paths.shift();
 				if(!path) {
 					return [this];
 				}
 				var result = [];
 				if(this.childers[path]) {
 					this.childers[path].forEach(function(childer) {
 						result = result.concat(childer.query(path));
 					});
 				};
 				return result;
 			}
 			this.add = function(paths, child) {
 				if(latte_lib.isString(paths)) {
 					paths = paths.split("/");
 				}
 				
 				if(!paths.length) {
 					return this.addChild(child);
 				}
 				var path = paths.shift();
 				if(this.childers[path]) {
 					this.childers[path].forEach(function(childer) {
 						childer.add(latte_lib.copy(paths), child);
 					});
 				}else{
 					var mchild = ObjectBase.create(path);
 					this.addChild(mchild);
 					mchild.add(paths, child);
 				}
 			}

 			this.update = function(index, result, partnerTran) {
 				var self = this;
 				var	partnerTram = this.doUpdate(index, result, partnerTran);
 				index++;
 				
 				Object.keys(this.childers).forEach(function(o) {
 					self.childers[o].forEach(function(child) {
 						child.update(index, result, partnerTram);
 					});
 				});
 				return result;
 			}
 			this.doUpdate = function(index, result, partner) {
 				var trandom = this.transform.update(partner);
 				trandom.type = "rectangle";
 				trandom.index = index;
 				trandom.backgroundColor = this.attribute.backgroundColor;
 				result.push(trandom);
 				return trandom;
 			}
 			this.isDown = function(point, index, partner) {
 				var result = [];
 				var trandom = this.transform.update(partner)
 				if(this.transform.in(point, trandom)) {
 					result.push({
 						index: index,
 						object: this
 					});
 				}

 				index ++;
 				var self = this;
 				Object.keys(this.childers).forEach(function(o) {
 					self.childers[o].forEach(function(child) {
 						var r = child.isDown(point, index,  trandom);
 						if(r) {
 							result.push(r);
 						}
 						
 					});
 				});
 				if(result.length == 0) {
 					return null;
 				}
 				var max = {index: -1};
 				result.forEach(function(o) {
 					if(o.index > max.index) {
 						max = o;
 					}
 				});
 				if(max.index == -1) {
 					return null;
 				}
 				if(!partner) {
 					max.object.emit("click",ObjectBase.createEvent(max.object));
 				}
 				return max;
 			}
 			this.on = function(type , func ) {
 				this.events.on(type, func);
 			}
 			this.emit = function(type, event) {
 				this.events.emit(type, event);
 				if(!event.stop && this.partner) {
 					this.partner.emit(type, event);
				}
 			}
 		}).call(ObjectBase.prototype);
		(function() {
			this.create = function(name, transform, attribute) {
				return new ObjectBase(name, transform, attribute);
			}
			this.createDefault = function() {
				return new ObjectBase();
			}
			this.createEvent = function(object) {
				var event =  {};
				event._stop = false;
				event.object = object;
				Object.defineProperty(event, "stop",  {
					set: function(value) {
						this._stop = value;
					},
					get: function() {
						return this._stop;
					}
				});
				return event;
			}
		}).call(ObjectBase);
 		module.exports = ObjectBase;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
