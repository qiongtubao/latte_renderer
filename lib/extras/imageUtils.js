(function(define) {'use strict'
	define("latte_renderer/extras/imageUtils", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var ImageUtils = {

 		};
 		(function() {
 			var self = this;
 			this.crossOrigin = undefined;
 			this.map = {};
 			this.loadTexture = function(url, mapping, onLoad, onError) {
 				var loader = new TextureLoader();
 				loader.setCrossOrigin(self.crossOrigin);
 				var texture = loader.load(url, onLoad, undefined, onError);
 				if(mapping) texture.mapping = mapping;
 				return texture;
 			}
 			this.loadImage = function(url, mapping, onLoad, onError) {
 				
 			}
 		}).call(ImageUtils);
 		module.exports = ImageUtils;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
