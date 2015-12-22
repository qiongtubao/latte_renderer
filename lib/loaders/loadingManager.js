(function(define) {'use strict'
	define("latte_renderer/loaders/loadingManager", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		var LoadingManager = function(onLoad, onProgress, onError) {
			var self = this;
			var isLoading = false, itemsLoaded = 0, itemsTotal = 0;
			this.onStart = undefined;
			this.onLoad = onLoad;
			this.onProgress = onProgress;
			this.onError = onError;

			this.itemStart = function(uri) {
				itemsTotal ++;
				if(isLoading === false) {
					if(self.onStart !== undefined) {
						self.onStart(url, itemsLoaded, itemsTotal);
					}
				}
				isLoading = true;
			};
			this.itemEnd = function(url) {
				itemsLoaded ++;
				if(self.onProgress !== undefined) {
					self.onProgress(url, itemsLoaded, itemsTotal);
				}

				if(itemsLoaded === itemsTotal) {
					isLoading = false;
					if(self.onLoad !== undefined) {
						self.onLoad();
					}
				}
			};
			this.itemError = function(url) {
				if(self.onError !== undefined) {
					self.onError(url);
				}
			}
		};

		(function() {
			this.DefaultLoadingManager = new LoadingManager();
		}).call(LoadingManager);
		module.exports = LoadingManager;

 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
