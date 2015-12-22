(function(define) {'use strict'
	define("latte_renderer/loaders/textureLoader", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var DefaultLoadingManager = require("./loadingManager").DefaultLoadingManager;
 		var TextureLoader = function(manager) {
 			this.manager = (manager !== undefined)? manager:DefaultLoadingManager;
 		};
 		(function() {
 			this.load = function() {
 				var texture = new Texture();
 				var loader = new ImageLoader(this.manager);
 				loader.setCrossOrigin(this.crossOrigin);
 				loadder.load(url, function(image) {
 					texture.image = image;
 					texture.needsUpdate = true;
 					if(onLoad !== undefined) {
 						onLoad(texture);
 					}
 				}, onProgress, onError);
 				return texture;
 			}
 			this.setCrossOrigin = function(value) {
 				this.crossorigin = value;
 			}
 		}).call(TextureLoader.prototype);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
