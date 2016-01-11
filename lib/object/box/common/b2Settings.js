(function(define) { 'use strict';
   define("latte_renderer/object/box/common/b2Settings", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Settings = function() {

   		};
   		(function() {

   		}).call(Settings.prototype);
   		(function() {   			
			this.USHRT_MAX = 0x0000ffff;
			this.b2_pi = Math.PI;
			this.b2_maxManifoldPoints = 2;
			this.b2_aabbExtension = 0.1;
			this.b2_aabbMultiplier = 2.0;
			this.b2_polygonRadius = 2.0 * this.b2_linearSlop;
			this.b2_linearSlop = 0.005;
			this.b2_angularSlop = 2.0 / 180.0 * this.b2_pi;
			this.b2_toiSlop = 8.0 * this.b2_linearSlop;
			this.b2_maxTOIContactsPerIsland = 32;
			this.b2_maxTOIJointsPerIsland = 32;
			this.b2_velocityThreshold = 1.0;
			this.b2_maxLinearCorrection = 0.2;
			this.b2_maxAngularCorrection = 8.0 / 180.0 * this.b2_pi;
			this.b2_maxTranslation = 2.0;
			this.b2_maxTranslationSquared = this.b2_maxTranslation * this.b2_maxTranslation;
			this.b2_maxRotation = 0.5 * this.b2_pi;
			this.b2_maxRotationSquared = this.b2_maxRotation * this.b2_maxRotation;
			this.b2_contactBaumgarte = 0.2;
			this.b2_timeToSleep = 0.5;
			this.b2_linearSleepTolerance = 0.01;
			this.b2_angularSleepTolerance = 2.0 / 180.0 * this.b2_pi;

			this.b2Assert = function(a) {
				if(!a) {
					throw "Assertion Failed";
				}
			}
			this.b2MixFriction = function(friction1, friction2) {
				if (friction1 === undefined) friction1 = 0;
				if (friction2 === undefined) friction2 = 0;
				return Math.sqrt(friction1 * friction2);
			}
			this.b2MixRestitution = function(restitution1, restitution2) {
				if (restitution1 === undefined) restitution1 = 0;
      			if (restitution2 === undefined) restitution2 = 0;
      			return restitution1 > restitution2 ? restitution1 : restitution2;
			}
   		}).call(Settings);
   		module.exports = Settings;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );