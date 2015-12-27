(function(define) {'use strict'
	define("latte_renderer/math/quaternion", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Quaternion = function(x,y,z,w) {
 			this._x = x || 0;
 			this._y = y || 0;
 			this._z = z || 0;
 			this._w = (w !== undefined)? w : 1;
 		};
 		latte_lib.inherits(Euler, latte_lib.events);
 		(function() {
 			this.constructor = Quaternion;
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
 			Object.defineProperty(this, "w", {
 				get: function() {
 					return this._w;
 				},
 				set: function(value) {
 					this._w = value;
 					this.emit("change");
 				},
 				configurable: false,
 				enumerable: false
 			});
 			this.clone = function() {
 				return new this.constructor(this._x, this._y, this._z, this._w);
 			}
 			this.copy = function(quaternion) {
 				this._x = quaternion.x;
 				this._y = quaternion.y;
 				this._z = quaternion.z;
 				this._w = quaternion.w;
 				this.emit("change");
 				return this;
 			}
 			this.setFromEuler = function(euler, update) {
 				if(euler instanceof Euler === false) {
 					throw new Error( 'THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );
 				}
 				//余弦
 				var c1 = Math.cos( euler._x / 2 );
				var c2 = Math.cos( euler._y / 2 );
				var c3 = Math.cos( euler._z / 2 );
				var s1 = Math.sin( euler._x / 2 );
				var s2 = Math.sin( euler._y / 2 );
				var s3 = Math.sin( euler._z / 2 );
				var order = euler.order;
				var z0 = s1 * c2 * c3;
				var z1 = c1 * s2 * s3;
				var z2 = c1 * s2 * c3;
				var z3 = s1 * c2 * s3;
				var z4 = c1 * c2 * s3;
				var z5 = s1 * s2 * c3;
				var z6 = c1 * c2 * c3;
				var z7 = s1 * s2 * s3;
				if(order === "XYZ") {
					this._x = z0 + z1;
					this._y = z2 - z3;
					this._z = z4 + z5;
					this._w = z6 - z7;
				}else if(order == "YXZ") {
					this._x = z0 + z1;
					this._y = z2 - z3;
					this._z = z4 - z5;
					this._w = z6 + z7;
				}else if(order === "ZXY") {
					this._x = z0 - z1;
					this._y = z2 + z3;
					this._z = z4 + z5;
					this._w = z6 - z7;
				}else if(order === "ZYX") {
					this._x = z0 - z1;
					this._y = z2 + z3;
					this._z = z4 - z5;
					this._w = z6 + z7;
				}else if(order === "YZX") {
					this._x = z0 - z1;
					this._y = z2 - z3;
					this._z = z4 + z5;
					this._w = z6 + z7;
				}
				if(update !== false ) this.emit("change");
				return this;
 			}
 			this.setFromAxisAngle = function(axis, angle) {
 				var halfAngle = angle / 2, s = Math.sin(halfAngle);
 				this._x = axis.x * s;
 				this._y = axis.y * s;
 				this._z = axis.z * s;
 				this._w = Math.cos(halfAngle);
 				this.emit("change");
 				return this;
 			}
 			this.setFromRotationMatrix = function(m) {
 				var te = m.elements,

					m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
					m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
					m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

					trace = m11 + m22 + m33,
					s;

				if ( trace > 0 ) {

					s = 0.5 / Math.sqrt( trace + 1.0 );

					this._w = 0.25 / s;
					this._x = ( m32 - m23 ) * s;
					this._y = ( m13 - m31 ) * s;
					this._z = ( m21 - m12 ) * s;

				} else if ( m11 > m22 && m11 > m33 ) {

					s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

					this._w = ( m32 - m23 ) / s;
					this._x = 0.25 * s;
					this._y = ( m12 + m21 ) / s;
					this._z = ( m13 + m31 ) / s;

				} else if ( m22 > m33 ) {

					s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

					this._w = ( m13 - m31 ) / s;
					this._x = ( m12 + m21 ) / s;
					this._y = 0.25 * s;
					this._z = ( m23 + m32 ) / s;

				} else {

					s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

					this._w = ( m21 - m12 ) / s;
					this._x = ( m13 + m31 ) / s;
					this._y = ( m23 + m32 ) / s;
					this._z = 0.25 * s;

				}

				this.onChangeCallback();

				return this;
 			}
 			this.setFromUnitVectors = function() {
 				var v1, r;
 				var EPS = 0.000001;
 				return function(vFrom, vTo) {
 					if(v1 === undefined) v1 = new Vector3();
 					r = vFrom.dot(vTo) + 1;
 					if(r < EPS) {
 						r = 0;
 						if(Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
 							v1.set( -vFrom.y, vFrom.x, 0);
 						}else{
 							v1.set(0, -vFrom.z, vFrom.y);
 						}
 					}else{
 						v1.crossVectors(vFrom, vTo);
 					}
 					this._x = v1.x;
 					this._y = v1.y;
 					this._z = v1.z;
 					this._w = r;
 					this.normalize();
 					return this;
 				}
 			}();
 			this.inverse = function() {
 				this.conjugate().normalize();
 				return this;
 			}
 			this.conjugate = function() {
 				this._x *= -1;
 				this._y *= -1;
 				this._z *= -1;
 				this.emit("change");
 				return this;
 			}
 			this.dot = function(v) {
 				return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
 			}
 			this.lengthSq = function() {
 				return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
 			}
 			this.length = function() {
 				return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
 			}
 			this.normalize = function() {
 				var l = this.length();
 				if ( l === 0 ) {

					this._x = 0;
					this._y = 0;
					this._z = 0;
					this._w = 1;

				} else {

					l = 1 / l;

					this._x = this._x * l;
					this._y = this._y * l;
					this._z = this._z * l;
					this._w = this._w * l;

				}

				this.emit("change");

				return this;
 			}
 			this.multiply = function(q, p) {
 				if ( p !== undefined ) {

					console.warn( 'THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
					return this.multiplyQuaternions( q, p );

				}

				return this.multiplyQuaternions( this, q );

 			}
 			this.multiplyQuaternions = function(a, b) {
 				var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
				var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

				this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
				this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
				this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
				this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

				this.onChangeCallback();

				return this;
 			}
 			this.multiplyVector3 = function ( vector ) {

				console.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
				return vector.applyQuaternion( this );

			}

			this.slerp = function ( qb, t ) {

				if ( t === 0 ) return this;
				if ( t === 1 ) return this.copy( qb );

				var x = this._x, y = this._y, z = this._z, w = this._w;

				// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

				var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

				if ( cosHalfTheta < 0 ) {

					this._w = - qb._w;
					this._x = - qb._x;
					this._y = - qb._y;
					this._z = - qb._z;

					cosHalfTheta = - cosHalfTheta;

				} else {

					this.copy( qb );

				}

				if ( cosHalfTheta >= 1.0 ) {

					this._w = w;
					this._x = x;
					this._y = y;
					this._z = z;

					return this;

				}

				var halfTheta = Math.acos( cosHalfTheta );
				var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

				if ( Math.abs( sinHalfTheta ) < 0.001 ) {

					this._w = 0.5 * ( w + this._w );
					this._x = 0.5 * ( x + this._x );
					this._y = 0.5 * ( y + this._y );
					this._z = 0.5 * ( z + this._z );

					return this;

				}

				var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
				ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

				this._w = ( w * ratioA + this._w * ratioB );
				this._x = ( x * ratioA + this._x * ratioB );
				this._y = ( y * ratioA + this._y * ratioB );
				this._z = ( z * ratioA + this._z * ratioB );

				this.onChangeCallback();

				return this;

			}

			this.equals = function ( quaternion ) {

				return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

			}

			this.fromArray = function ( array, offset ) {

				if ( offset === undefined ) offset = 0;

				this._x = array[ offset ];
				this._y = array[ offset + 1 ];
				this._z = array[ offset + 2 ];
				this._w = array[ offset + 3 ];

				this.onChangeCallback();

				return this;

			}

			this.toArray = function ( array, offset ) {

				if ( array === undefined ) array = [];
				if ( offset === undefined ) offset = 0;

				array[ offset ] = this._x;
				array[ offset + 1 ] = this._y;
				array[ offset + 2 ] = this._z;
				array[ offset + 3 ] = this._w;

				return array;

			}

			this.onChange = function ( callback ) {

				this.on("change", callback);

				return this;

			}
 		}).call(Quaternion.prototype);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
