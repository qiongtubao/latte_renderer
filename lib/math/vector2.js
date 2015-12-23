(function(define) {'use strict'
	define("latte_renderer/math/vector2", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Vector2 = function(x, y) {
 			this.x = x || 0;
 			this.y = y || 0;
 		};
 		(function() {
 			this.constructor = Vector2;
 			this.set = function(x, y) {
 				this.x = x;
 				this.y = y;
 			}
 			this.clone = function(v) {
 				return new this.constructor( this.x, this.y );
 			}
 			this.copy = function(v) {
				this.x = v.x;
				this.y = v.y;
 			}
 			this.add = function(v) {
 				this.x += v.x;
				this.y += v.y;
				return this;
 			}
 			this.addScalar = function(s) {
 				this.x += s;
 				this.y += s;
 				return this;
 			}
 			this.addVectors = function ( a, b ) {
				this.x = a.x + b.x;
				this.y = a.y + b.y;
				return this;
			}
			this.addScaledVector = function ( v, s ) {
				this.x += v.x * s;
				this.y += v.y * s;
				return this;
			}
			this.sub = function(v) {
				this.x -= v.x;
				this.y -= v.y;
				return this;
			}
			this.subScalar = function(s) {
				this.x -= s;
				this.y -= s;
				return this;
			}
			this.subvectors = function(a,b) {
				this.x = a.x - b.x;
				this.y = a.y - b.y;
				return this;
			}
			this.multiply = function(v) {
				this.x *= v.x;
				this.y *= v,y;
				return this;
			}
			this.multiplyScalar = function(scalar) {
				if(isFinite(scalar)) {
					this.x *= scalar;
					this.y *= scalar;
				}else{
					this.x = 0;
					this.y = 0;
				}
				return this;
			}
			this.divide = function(v) {
				this.x /= v.x;
				this.y /= v.y;
				return this;
			}
			this.divideScalar = function(scalar) {
				return this.multiplyScalar( 1 / scalar );
			}
			this.min = function ( v ) {
				this.x = Math.min( this.x, v.x );
				this.y = Math.min( this.y, v.y );
				return this;
			}

			this.max = function(v) {
				this.x = Math.max( this.x, v.x );
				this.y = Math.max( this.y, v.y );

				return this;
			}
			this.clamp = function() {
				this.x = Math.max( min.x, Math.min( max.x, this.x ) );
				this.y = Math.max( min.y, Math.min( max.y, this.y ) );

				return this;
			}
			this.clampScalar = function () {

				var min, max;

				return function clampScalar( minVal, maxVal ) {

					if ( min === undefined ) {

						min = new THREE.Vector2();
						max = new THREE.Vector2();

					}

					min.set( minVal, minVal );
					max.set( maxVal, maxVal );

					return this.clamp( min, max );

				};

			}();
			this.clampLength = function ( min, max ) {
				var length = this.length();
				this.multiplyScalar( Math.max( min, Math.min( max, length ) ) / length );
				return this;
			}
			this.floor = function () {
				this.x = Math.floor( this.x );
				this.y = Math.floor( this.y );
				return this;
			}
			this.ceil = function () {

				this.x = Math.ceil( this.x );
				this.y = Math.ceil( this.y );

				return this;

			}
			this.round = function() {
				this.x = Math.round( this.x );
				this.y = Math.round( this.y );
				return this;
			}
			this.roundToZero = function() {
				this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
				this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
				return this;
			}
			this.negate = function() {
				this.x = -this.x;
				this.y = -this.y;
				return this;
			}
			this.dot = function(v) {
				return this.x * v.x + this.y * v.y;
			}
			this.lengthSq = function() {
				return this.x * this.x + this.y * this.y;
			}
			this.length = function () {
				return Math.sqrt( this.x * this.x + this.y * this.y );
			}
			this.lengthManhattan = function() {
				return Math.abs(this.x) + Math.abs(this.y);
			}
			this.normalize = function() {
				return this.divideScalar(this.length());
			}
			this.distanceTo = function ( v ) {
				return Math.sqrt( this.distanceToSquared( v ) );
			}
			this.distanceToSquared = function(v) {
				var dx = this.x - v.x, dy = this.y - v.y;
				return dx * dx + dy * dy;
			}
			this.setLength = function(lenth) {
				return this.multiplyScalar( length / this.length() );
			}
			this.lerp = function ( v, alpha ) {
				this.x += ( v.x - this.x ) * alpha;
				this.y += ( v.y - this.y ) * alpha;
				return this;
			}
			this.lerpvectors = function(v1, v2, alpha) {
				this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );
				return this;
			}
			this.equals = function(v) {
				return ((v.x === this.x) && (v.y === this.y));
			}
			this.fromArray = function(array, offset) {
				if(offset === undefined) offset = 0;
				this.x = array[ offset ];
				this.y = array[ offset + 1 ];
				return this;
			}
			this.toArray = function(array, offset) {
				if(array === undefined) array = [];
				if(offset === undefined) offset = 0;
				array[offset] =  this.x;
				array[offset + 1] = this.y;
				return array; 
			}
			this.fromAttribute = function(attribute, index, offset) {
				if(offset === undefined) offset = 0;
				index = index * attribute.itemSize + offset;
				this.x = attribute.array[index];
				this.y = attribute.array[index + 1];
				return this;
			}
			this.rotateAround = function(center, angle) {
				var c = Math.cos(angle), s= Math.sin(angle);
				var x = this.x - center.x;
				var y = this.y - center.y;
				this.x = x * c - y *s + center.x;
				this.y = x * s + y * c + center.y;
				return this;
			}
 		}).call(Vector2.prototype);
 		module.exports = Vector2;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
