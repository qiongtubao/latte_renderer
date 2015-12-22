(function(define) {'use strict'
	define("latte_renderer/loaders/imageLoader", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Cache = require("./cache");
 		var ImageLoader = function(manager) {
 			this.manager = (manager !== undefined)?manager: DefaultLoadingManager;
 		};
 		(function() {
 			this.load = function(url, onLoad, onProgress, onError) {
 				var self = this;
 				var cached = Cache.get(url);
 				if(cached !== undefined) {
 					self.manager.itemStart(url);
 					if(onLoad) {
 						setTimeout(function() {
 							onLoad(cached);
 							self.manager.itemEnd(url);
 						}, 0);
 					}else{
 						self.manager.itemEnd( url );
 					}
 					return cached;
 				}
 				var image = document.createElement( 'img' );

				image.addEventListener( 'load', function ( event ) {

					Cache.add( url, this );

					if ( onLoad ) onLoad( this );

					self.manager.itemEnd( url );

				}, false );

				if ( onProgress !== undefined ) {

					image.addEventListener( 'progress', function ( event ) {

						onProgress( event );

					}, false );

				}

				image.addEventListener( 'error', function ( event ) {

					if ( onError ) onError( event );

					self.manager.itemError( url );

				}, false );

				if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

				self.manager.itemStart( url );

				image.src = url;

				return image;
 			}
 			this.setCrossOrigin = function(value) {
 				this.crossOrigin = value;
 			}
 		}).call(ImageLoader.prototype);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
