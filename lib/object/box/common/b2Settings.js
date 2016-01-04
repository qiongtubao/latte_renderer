(function(define) { 'use strict';
   define("latte_renderer/object/box/common/b2Settings", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Settings = function() {

   		};
   		(function() {

   		}).call(Settings.prototype);
   		(function() {   			
			this.USHRT_MAX = 0x0000ffff;
			this.pi = Math.PI;
			this.maxManifoldPoints = 2;
			this.aabbExtension = 0.1;
			this.aabbMultiplier = 2.0;
			this.polygonRadius = 2.0 * Settings.b2_linearSlop;
			this.linearSlop = 0.005;
			this.angularSlop = 2.0 / 180.0 * Settings.b2_pi;
			this.toiSlop = 8.0 * Settings.b2_linearSlop;
			this.maxTOIContactsPerIsland = 32;
			this.maxTOIJointsPerIsland = 32;
			this.velocityThreshold = 1.0;
			this.maxLinearCorrection = 0.2;
			this.maxAngularCorrection = 8.0 / 180.0 * Settings.b2_pi;
			this.maxTranslation = 2.0;
			this.maxTranslationSquared = Settings.b2_maxTranslation * Settings.b2_maxTranslation;
			this.maxRotation = 0.5 * Settings.b2_pi;
			this.maxRotationSquared = Settings.b2_maxRotation * Settings.b2_maxRotation;
			this.contactBaumgarte = 0.2;
			this.timeToSleep = 0.5;
			this.linearSleepTolerance = 0.01;
			this.angularSleepTolerance = 2.0 / 180.0 * Settings.b2_pi;

			this.b2Assert = function(a) {
				if(!a) {
					throw "Assertion Failed";
				}
			}
   		}).call(Settings);
   		module.exports = Settings;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );