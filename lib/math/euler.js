(function(define) {'use strict'
	define("latte_renderer/math/euler", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Euler = function(x,y,z,order) {
 			this._x = x || 0;
 			this._y = y || 0;
 			this._z = z || 0;
 			this._order = order || Euler.DefaultOrder;
 		};
 		(function() {
 			RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"];
 			DefaultOrder = "XYZ";
 		}).call(Euler);
 		latte_lib.inherits(Euler, latte_lib.events);
 		(function() {
 			Object.defineProperty(this, "x", {
 				get: function() {
 					return this._x;
 				},
 				set: function(value) {
 					this._x = value;
 					this.emit("change");
 				},
 				configurable: false,
 				enumerable: false
 			});
 			Object.defineProperty(this, "y", {
 				get: function() {
 					return this._y;
 				},
 				set: function(value) {
 					this._y = value;
 					this.emit("change");
 				},
 				configurable: false,
 				enumerable: false
 			});
 			Object.defineProperty(this, "z", {
 				get: function() {
 					return this._z;
 				},
 				set: function(value) {
 					this._z = value;
 					this.emit("change");
 				},
 				configurable: false,
 				enumerable: false
 			});
 			Object.defineProperty(this, "order", {
 				get: function() {
 					return this._order;
 				},
 				set: function(value) {
 					this._order = value;
 					this.emit("change");
 				},
 				configurable: false,
 				enumerable: false
 			});
 			this.clone = function() {
 				return new this.constructor(this._x, this._y, this._z);
 			}
 			this.copy = function() {
 				this._x = euler._x;
 				this._y = euler._y;
 				this._z = euler._z;
 				this._order = euler._order;
 				this.emit("change");
 				return this;
 			}
 			/*
 			this.setFromQuaternion  = (function() {
 				var matrix;
 				return function(q, order, update) {
 					if(matrix === undefined) matrix = new Matrix4();
 					matrix.makeRotationFromQuaternion(q);
 					this.setFromRotationMatrix(matrix, order, update);
 					return this;
 				};
 			})();
*/
 			this.setFromVector3 = function(v, order) {
 				return this.set(v.x, v.y, v.z, order || this._order);
 			}
 			this.equals = function ( euler ) {

				return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

			}
 			this.fromArray = function ( array ) {

				this._x = array[ 0 ];
				this._y = array[ 1 ];
				this._z = array[ 2 ];
				if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

				this.onChangeCallback();

				return this;

			}

			this.toArray = function ( array, offset ) {

				if ( array === undefined ) array = [];
				if ( offset === undefined ) offset = 0;

				array[ offset ] = this._x;
				array[ offset + 1 ] = this._y;
				array[ offset + 2 ] = this._z;
				array[ offset + 3 ] = this._order;

				return array;

			}
 			this.toVector3 = function(optionalResult) {
 				if(optionalResult) {
 					return optionalResult.set(this._x, this._y, this._z);
 				}else{
 					return new Vector3(this._x, this._y, this._z);
 				}
 			}
 		}).call(Euler.prototype);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
