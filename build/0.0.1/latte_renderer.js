(function() {

var LATTE_NAMESPACE = "latte";
var global = (function() {
	return this;
})();
if (!LATTE_NAMESPACE && typeof requirejs !== "undefined")
return;

var _define = function(module, deps, payload) {
    if (typeof module !== 'string') {
        if (_define.original)
            _define.original.apply(window, arguments);
        else {
            console.error('dropping module because define wasn\'t a string.');
            console.trace();
        }
        return;
    }

    if (arguments.length == 2)
        payload = deps;

    if (!_define.modules) {
        _define.modules = {};
        _define.payloads = {};
    }
    
    _define.payloads[module] = payload;
    _define.modules[module] = null;
};

var _require = function(parentId, module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(parentId, module[i]);
            if (!dep && _require.original)
                return _require.original.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(parentId, module);
        if (!payload && _require.original)
            return _require.original.apply(window, arguments);

        if (callback) {
            callback();
        }

        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

var resolve = function(parentId, moduleName) {
    if(moduleName.charAt(0) == ".") {
        var ps = parentId.split("/");
        var base = ps.pop();
        //var paths = ps.join("/");
        var ms = moduleName.split("/");
        var n ;
        while((n = ms.shift())) {
          if(n == "..") {
            ps.pop();
          }else if(n != "."){
            ps.push(n);
          }
        }
        return ps.join("/");
    }
    return moduleName;

}

var normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return normalizeModule(parentId, chunks[0]) + "!" + normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    /*if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = base + "/" + moduleName;

        while(moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }*/
    //console.log(parentId, moduleName);
    name = resolve(parentId, moduleName);
    //console.log(parentId, moduleName, name);
    return name;
};
var lookup = function(parentId, moduleName) {

    moduleName = normalizeModule(parentId, moduleName);

    var module = _define.modules[moduleName];
    if (!module) {
        module = _define.payloads[moduleName];
        if (typeof module === 'function') {
            var exports = {};
            var mod = {
                id: moduleName,
                uri: '',
                exports: exports,
                packaged: true
            };

            var req = function(module, callback) {
                return _require(moduleName, module, callback);
            };

            var returnValue = module(req, exports, mod, global);
            exports = returnValue || mod.exports;
            _define.modules[moduleName] = exports;
            delete _define.payloads[moduleName];
        }
        module = exports || module;
        if(!module && moduleName.indexOf("/index") == -1) {
            module = _define.modules[moduleName] = lookup(parentId, moduleName+"/index");
        }

    }
    if(!module) {
      console.log("unload error",parentId, moduleName);
    }
     _define.modules[moduleName]  = module;
    return module;
};

function exportWindow(ns) {
    var require = function(module, callback) {
        return _require("", module, callback);
    };    

    var root = global;
    if (ns) {
        if (!global[ns])
            global[ns] = {};
        root = global[ns];
    }

    if (!root.define || !root.define.packaged) {
        _define.original = root.define;
        root.define = _define;
        root.define.packaged = true;
    }

    if (!root.require || !root.require.packaged) {
        _require.original = root.require;
        root.require = require;
        root.require.packaged = true;
    }
}

exportWindow(LATTE_NAMESPACE);
    //window._require = require;
    
})();
latte.global = this;
this.define = latte.define;

latte.config = {};
(function() {
    this.config = {};
}).call(latte);
(function(define) { 'use strict';
	define("latte_lib/async", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var latte_lib = require("./lib");
		if(!latte_lib) {
			console.log("no load lib");
		}
		/**
		*	@class async
		*	@namespace latte_lib
		*	@module basic
		*/
		(function() {
			var _self = this;
			this.setImmediate = latte_lib.setImmediate;
			/**
			*	单次执行
			*	@method only_once
			*	@static
			*	@param    {function}  fn   只执行一次的函数
			*	@public
			*	@async
			*	@since 0.0.1
			*	@example

					var async = require("latte_lib").async;
					var f = async.only_once(function(data) {
						log(data);
					});
					f("a");
					f("b");
					//"a"
					//error  callback was already called.
			*/
			var only_once = this.only_once = function(fn) {
				var called = false;
				return function() {
					if (called) throw new Error("Callback was already called.");
					called = true;
					fn.apply(_self, arguments);
				}
			};
			/**
			*	并行执行
			*	@method forEach
			*	@static
			*	@param   arr   {array}  需要被执行函数的数组
			*	@param   iterator  {function}  执行函数
			*	@param   callback  {function}  回调函数
			*	@async
			*	@since 0.0.1
			*	@example

					var async = require("latte_lib").async;
					var result = [];
					async.forEach([1,2,3,4], function(data, callback) {
						if(data == 3) {
							callback("is 3");
						}else{
							result.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result);// [2,4]
					});

					var result2 = [];
					async.forEach([1,2,3,4], function(data, callback) {
						if(data == 3) {
							setTimeout(function() {
								callback("is 3");
							}, 1);
						}else{
							result2.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result2);// [2,4,8]
					});
			*
			*/
			this.forEach = this.each = function(arr, iterator, callback) {
				callback = callback || function(){};
				if(!arr.length) {
					return callback();
				}
				var completed = 0;
				latte_lib.forEach(arr, function (x) {
		            iterator(x, only_once(done) );
		        });
		        function done(err) {
		          if (err) {
		              callback(err);
		              callback = function () {};
		          }
		          else {
		              completed += 1;
		              if (completed >= arr.length) {
		                  callback();
		              }
		          }
		        }
			};

			/**
				串行执行
				@method forEachSeries
				@static
				@param   arr   {array}  需要被执行函数的数组
				@param   iterator  {function}  执行函数
				@param   callback  {function}  回调函数
				@sync
				@since 0.0.1
				@example
					var async = require("latte_lib").async;
					var result = [];
					async.forEachSeries([1,2,3,4], function(data, callback) {
						if(data == 3) {
							callback("is 3");
						}else{
							result.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result);// [2,4]
					});

					var result2 = [];
					async.forEachSeries([1,2,3,4], function(data, callback) {
						if(data == 3) {
							setTimeout(function() {
								callback("is 3");
							}, 1);
						}else{
							result2.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result2);// [2,4,8]
					});
			*/
			this.forEachSeries = this.eachSeries = function(arr, iterator, callback) {
				callback = callback || function() {};
				if (!arr.length) {
		            return callback();
		        }
		        var completed = 0;
		        (function iterate() {
		            iterator(arr[completed], function (err) {
		                if (err) {
		                    callback(err);
		                    callback = function () {};
		                }
		                else {
		                    completed += 1;
		                    if (completed >= arr.length) {
		                        callback();
		                    }
		                    else {
		                        iterate();
		                    }
		                }
		            });
		        })();
			};

			this.forEachLimit = this.eachLimit = function(arr, limit, iterator, callback) {
				var fn = _eachLimit(limit);
	        	fn.apply(null, [arr, iterator, callback]);
			};

			var _eachLimit = function(limit) {
				return function(arr, iterator, callback) {
					callback = callback || function() {};
					if (!arr.length || limit <= 0) {
		                return callback();
		            }
		            var completed = 0;
		            var started = 0;
		            var running = 0;
	             	(function replenish () {
		                if (completed >= arr.length) {
		                    return callback();
		                }

		                while (running < limit && started < arr.length) {
		                    started += 1;
		                    running += 1;
		                    iterator(arr[started - 1], function (err) {
		                        if (err) {
		                            callback(err);
		                            callback = function () {};
		                        }
		                        else {
		                            completed += 1;
		                            running -= 1;
		                            if (completed >= arr.length) {
		                                callback();
		                            }
		                            else {
		                                replenish();
		                            }
		                        }
		                    });
		                }
		            })();
				};
			};

			var doParallel = function (fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_self.each].concat(args));
		        };
		    };

		    var doParallelLimit = function(limit, fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_eachLimit(limit)].concat(args));
		        };
		    };

		    var doSeries = function (fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_self.eachSeries].concat(args));
		        };
		    };

		    var _asyncMap = function(eachfn, arr, iterator, callback) {
		    	arr = latte_lib.map(arr, function(x, i) {
		    		return {
		    			index: i,
		    			value: x
		    		};
		    	});
		    	if (!callback) {
		            eachfn(arr, function (x, callback) {
		                iterator(x.value, function (err) {
		                    callback(err);
		                });
		            });
		        } else {
		            var results = [];
		            eachfn(arr, function (x, callback) {
		                iterator(x.value, function (err, v) {
		                    results[x.index] = v;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };

		    this.map = doParallel(_asyncMap);
		    this.mapSeries = doSeries(_asyncMap);

		    var _mapLimit = function(limit) {
		        return doParallelLimit(limit, _asyncMap);
		    };

		    this.mapLimit = function(arr, limit, iterator, callback) {
		    	return _mapLimit(limit)(arr, iterator, callback);
		    };

		    this.inject = this.foldl = this.reduce = function(arr, memo, iterator, callback) {
		    	_self.eachSeries(arr, function(x, callback) {
		    		iterator(memo, x, function (err, v) {
		                memo = v;
		                callback(err);
		            });
		    	}, function (err) {
		            callback(err, memo);
		        });
		    };

		    this.foldr = this.reduceRight = function (arr, memo, iterator, callback) {
		        var reversed = latte_lib.map(arr, function (x) {
		            return x;
		        }).reverse();
		        _self.reduce(reversed, memo, iterator, callback);
		    };
		    var _filter = function (eachfn, arr, iterator, callback) {
		        var results = [];
		        arr = latte_lib.map(arr, function (x, i) {
		            return {index: i, value: x};
		        });
		        eachfn(arr, function (x, callback) {
		            iterator(x.value, function (v) {
		                if (v) {
		                    results.push(x);
		                }
		                callback();
		            });
		        }, function (err) {
		            callback(latte_lib.map(results.sort(function (a, b) {
		                return a.index - b.index;
		            }), function (x) {
		                return x.value;
		            }));
		        });
		    };

		    this.select = this.filter = doParallel(_filter);
	    	this.selectSeries = this.filterSeries = doSeries(_filter);

	    	var _reject = function (eachfn, arr, iterator, callback) {
		        var results = [];
		        arr = latte_lib.map(arr, function (x, i) {
		            return {index: i, value: x};
		        });
		        eachfn(arr, function (x, callback) {
		            iterator(x.value, function (v) {
		                if (!v) {
		                    results.push(x);
		                }
		                callback();
		            });
		        }, function (err) {
		            callback(latte_lib.map(results.sort(function (a, b) {
		                return a.index - b.index;
		            }), function (x) {
		                return x.value;
		            }));
		        });
		    };

		    this.reject = doParallel(_reject);
	 		this.rejectSeries = doSeries(_reject);

	 		var _detect = function (eachfn, arr, iterator, main_callback) {
		        eachfn(arr, function (x, callback) {
		            iterator(x, function (result) {
		                if (result) {
		                    main_callback(x);
		                    main_callback = function () {};
		                }
		                else {
		                    callback();
		                }
		            });
		        }, function (err) {
		            main_callback();
		        });
		    };

		    this.detect = doParallel(_detect);
		 	this.detectSeries = doSeries(_detect);

		 	this.any = this.some = function(arr, iterator, main_callback) {
		 		_self.each(arr, function (x, callback) {
		            iterator(x, function (v) {
		                if (v) {
		                    main_callback(true);
		                    main_callback = function () {};
		                }
		                callback();
		            });
		        }, function (err) {
		            main_callback(false);
		        });
		 	};

		 	this.all = this.every = function (arr, iterator, main_callback) {
		        _self.each(arr, function (x, callback) {
		            iterator(x, function (v) {
		                if (!v) {
		                    main_callback(false);
		                    main_callback = function () {};
		                }
		                callback();
		            });
		        }, function (err) {
		            main_callback(true);
		        });
		    };

		    this.sortBy = function (arr, iterator, callback) {
		        _self.map(arr, function (x, callback) {
		            iterator(x, function (err, criteria) {
		                if (err) {
		                    callback(err);
		                }
		                else {
		                    callback(null, {value: x, criteria: criteria});
		                }
		            });
		        }, function (err, results) {
		            if (err) {
		                return callback(err);
		            }
		            else {
		                var fn = function (left, right) {
		                    var a = left.criteria, b = right.criteria;
		                    return a < b ? -1 : a > b ? 1 : 0;
		                };
		                callback(null, latte_lib.map(results.sort(fn), function (x) {
		                    return x.value;
		                }));
		            }
		        });
		    };
		    /**
		    	自动 并行 如果有依赖的话等依赖好了在执行
		    	@method auto
		    	@static
		    	@param {json} tasks
				@param {function} callback
				@async
				@since 0.0.1
				@example

					var async = require("latte_lib").async;
					async.auto({
						a: ["c",function(callback) {
							log("a");
							callback(null,3);
						}],
						b: function(callback) {
							log("b");
							callback(null, 1);
						},
						c: function(callback) {
							log("c");
							callback(null, 2);
						},
						d: ["a", function(callback) {
							log("d");
							callback(null, 4);
						}]
					}, function(err, results) {
						log("err:",err);
						log("results:", results);// {"b":1,"c":2,"a":3,"d":4}
					});


					async.auto({
						a: ["c",function(callback) {
							log("a");
							callback("is 3", 3);
						}],
						b: function(callback) {
							log("b");
							callback(null, 1);
						},
						c: function(callback) {
							log("c");
							callback(null, 2);
						},
						d: ["a", function(callback) {
							log("d");
							callback(null, 4);
						}]
					}, function(err, results) {
						log("err:",err);	// is 3
						log("results:", results);// {"b":1,"c":2, "a":3}
					});
		    */
		    this.auto = function (tasks, callback) {
		        callback = callback || function () {};
		        var keys = latte_lib.keys(tasks);
		        var remainingTasks = keys.length
		        if (!remainingTasks) {
		            return callback();
		        }

		        var results = {};

		        var listeners = [];
		        var addListener = function (fn) {
		            listeners.unshift(fn);
		        };
		        var removeListener = function (fn) {
		            for (var i = 0; i < listeners.length; i += 1) {
		                if (listeners[i] === fn) {
		                    listeners.splice(i, 1);
		                    return;
		                }
		            }
		        };
		        var taskComplete = function () {
		            remainingTasks--
		            latte_lib.forEach(listeners.slice(0), function (fn) {
		                fn();
		            });
		        };

		        addListener(function () {
		            if (!remainingTasks) {
		                var theCallback = callback;
		                // prevent final callback from calling itself if it errors
		                callback = function () {};

		                theCallback(null, results);
		            }
		        });

		        latte_lib.forEach(keys, function (k) {
		            var task = latte_lib.isArray(tasks[k]) ? tasks[k]: [tasks[k]];
		            var taskCallback = function (err) {
		                var args = Array.prototype.slice.call(arguments, 1);
		                if (args.length <= 1) {
		                    args = args[0];
		                }
		                if (err) {
		                    var safeResults = {};
		                    latte_lib.forEach(latte_lib.keys(results), function(rkey) {
		                        safeResults[rkey] = results[rkey];
		                    });
		                    safeResults[k] = args;
		                    callback(err, safeResults);
		                    // stop subsequent errors hitting callback multiple times
		                    callback = function () {};
		                }
		                else {
		                    results[k] = args;
		                    latte_lib.setImmediate(taskComplete);
		                }
		            };
		            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
		            var ready = function () {
		                return latte_lib.reduce(requires, function (a, x) {
		                    return (a && results.hasOwnProperty(x));
		                }, true) && !results.hasOwnProperty(k);
		            };
		            if (ready()) {
		                task[task.length - 1](taskCallback, results);
		            }
		            else {
		                var listener = function () {
		                    if (ready()) {
		                        removeListener(listener);
		                        task[task.length - 1](taskCallback, results);
		                    }
		                };
		                addListener(listener);
		            }
		        });
		    };

		    this.retry = function(times, task, callback) {
		        var DEFAULT_TIMES = 5;
		        var attempts = [];
		        // Use defaults if times not passed
		        if (typeof times === 'function') {
		            callback = task;
		            task = times;
		            times = DEFAULT_TIMES;
		        }
		        // Make sure times is a number
		        times = parseInt(times, 10) || DEFAULT_TIMES;
		        var wrappedTask = function(wrappedCallback, wrappedResults) {
		            var retryAttempt = function(task, finalAttempt) {
		                return function(seriesCallback) {
		                    task(function(err, result){
		                        seriesCallback(!err || finalAttempt, {err: err, result: result});
		                    }, wrappedResults);
		                };
		            };
		            while (times) {
		                attempts.push(retryAttempt(task, !(times-=1)));
		            }
		            _self.series(attempts, function(done, data){
		                data = data[data.length - 1];
		                (wrappedCallback || callback)(data.err, data.result);
		            });
		        }
		        // If a callback is passed, run this as a controll flow
		        return callback ? wrappedTask() : wrappedTask
		    };

		    this.waterfall = function (tasks, callback) {
		        callback = callback || function () {};
		        if (!latte_lib.isArray(tasks)) {
		          var err = new Error('First argument to waterfall must be an array of functions');
		          return callback(err);
		        }
		        if (!tasks.length) {
		            return callback();
		        }
		        var wrapIterator = function (iterator) {
		            return function (err) {
		                if (err) {
		                    callback.apply(null, arguments);
		                    callback = function () {};
		                }
		                else {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    var next = iterator.next();
		                    if (next) {
		                        args.push(wrapIterator(next));
		                    }
		                    else {
		                        args.push(callback);
		                    }
		                    latte_lib.setImmediate(function () {
		                        iterator.apply(null, args);
		                    });
		                }
		            };
		        };
		        wrapIterator(_self.iterator(tasks))();
		    };

		    var _parallel = function(eachfn, tasks, callback) {
		        callback = callback || function () {};
		        if (latte_lib.isArray(tasks)) {
		            eachfn.map(tasks, function (fn, callback) {
		                if (fn) {
		                    fn(function (err) {
		                        var args = Array.prototype.slice.call(arguments, 1);
		                        if (args.length <= 1) {
		                            args = args[0];
		                        }
		                        callback.call(null, err, args);
		                    });
		                }
		            }, callback);
		        }
		        else {
		            var results = {};
		            eachfn.each(latte_lib.keys(tasks), function (k, callback) {
		                tasks[k](function (err) {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    if (args.length <= 1) {
		                        args = args[0];
		                    }
		                    results[k] = args;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };
		    /**
		    	@method parallel
		    	@async
				@param {function[]} tasks
				@param {function} callback
				@example

					var async = require("latte_lib").async;
					async.parallel([
						function(cb) {
							cb(null, 1);
						},
						function(cb) {
							setTimeout(function() {
								cb("is 2");
							}, 1);
						},
						function(cb) {
							cb(null, 3);
						}
					],function(err, result) {
						log(err);  //is 2
						log(result);//[1,null,3]
					});
		    */

		    this.parallel = function (tasks, callback) {
		        _parallel({ map: _self.map, each: _self.each }, tasks, callback);
		    };

		    this.parallelLimit = function(tasks, limit, callback) {
		        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
		    };
		    /**
		    	@method series
		    	@async
				@param {function[]} tasks
				@param {function} callback
				@example

					var async = require("latte_lib").async;
					async.series([
						function(cb) {
							cb(null, 1);
						},
						function(cb) {
							setTimeout(function() {
								cb("is 2");
							}, 1);
						},
						function(cb) {
							cb(null, 3);
						}
					],function(err, result) {
						log(err);  //is 2
						log(result);//[1,null]
					});
		    */
		    this.series = function (tasks, callback) {
		        callback = callback || function () {};
		        if (latte_lib.isArray(tasks)) {
		            _self.mapSeries(tasks, function (fn, callback) {
		                if (fn) {
		                    fn(function (err) {
		                        var args = Array.prototype.slice.call(arguments, 1);
		                        if (args.length <= 1) {
		                            args = args[0];
		                        }
		                        callback.call(null, err, args);
		                    });
		                }
		            }, callback);
		        }
		        else {
		            var results = {};
		            _self.eachSeries(_keys(tasks), function (k, callback) {
		                tasks[k](function (err) {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    if (args.length <= 1) {
		                        args = args[0];
		                    }
		                    results[k] = args;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };

		    this.iterator = function (tasks) {
		        var makeCallback = function (index) {
		            var fn = function () {
		                if (tasks.length) {
		                    tasks[index].apply(null, arguments);
		                }
		                return fn.next();
		            };
		            fn.next = function () {
		                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
		            };
		            return fn;
		        };
		        return makeCallback(0);
		    };

		    this.apply = function (fn) {
		        var args = Array.prototype.slice.call(arguments, 1);
		        return function () {
		            return fn.apply(
		                null, args.concat(Array.prototype.slice.call(arguments))
		            );
		        };
		    };

		    var _concat = function (eachfn, arr, fn, callback) {
		        var r = [];
		        eachfn(arr, function (x, cb) {
		            fn(x, function (err, y) {
		                r = r.concat(y || []);
		                cb(err);
		            });
		        }, function (err) {
		            callback(err, r);
		        });
		    };
		    this.concat = doParallel(_concat);
	    	this.concatSeries = doSeries(_concat);
	    	this.whilst = function (test, iterator, callback) {
		        if (test()) {
		            iterator(function (err) {
		                if (err) {
		                    return callback(err);
		                }
		                _self.whilst(test, iterator, callback);
		            });
		        }
		        else {
		            callback();
		        }
		    };

		    this.doWhilst = function (iterator, test, callback) {
		        iterator(function (err) {
		            if (err) {
		                return callback(err);
		            }
		            var args = Array.prototype.slice.call(arguments, 1);
		            if (test.apply(null, args)) {
		                _self.doWhilst(iterator, test, callback);
		            }
		            else {
		                callback();
		            }
		        });
		    };

		    this.until = function(test, iterator, callback) {
		    	if (!test()) {
		            iterator(function (err) {
		                if (err) {
		                    return callback(err);
		                }
		                _self.until(test, iterator, callback);
		            });
		        }
		        else {
		            callback();
		        }
		    };

		    this.doUntil = function (iterator, test, callback) {
		        iterator(function (err) {
		            if (err) {
		                return callback(err);
		            }
		            var args = Array.prototype.slice.call(arguments, 1);
		            if (!test.apply(null, args)) {
		                _self.doUntil(iterator, test, callback);
		            }
		            else {
		                callback();
		            }
		        });
		    };

		    this.queue = function (worker, concurrency) {
		        if (concurrency === undefined) {
		            concurrency = 1;
		        }
		        function _insert(q, data, pos, callback) {
		          if (!q.started){
		            q.started = true;
		          }
		          if (!_isArray(data)) {
		              data = [data];
		          }
		          if(data.length == 0) {
		             // call drain immediately if there are no tasks
		             return latte_lib.setImmediate(function() {
		                 if (q.drain) {
		                     q.drain();
		                 }
		             });
		          }
		          latte_lib.forEach(data, function(task) {
		              var item = {
		                  data: task,
		                  callback: typeof callback === 'function' ? callback : null
		              };

		              if (pos) {
		                q.tasks.unshift(item);
		              } else {
		                q.tasks.push(item);
		              }

		              if (q.saturated && q.tasks.length === q.concurrency) {
		                  q.saturated();
		              }
		              latte_lib.setImmediate(q.process);
		          });
		        }

		        var workers = 0;
		        var q = {
		            tasks: [],
		            concurrency: concurrency,
		            saturated: null,
		            empty: null,
		            drain: null,
		            started: false,
		            paused: false,
		            push: function (data, callback) {
		              _insert(q, data, false, callback);
		            },
		            kill: function () {
		              q.drain = null;
		              q.tasks = [];
		            },
		            unshift: function (data, callback) {
		              _insert(q, data, true, callback);
		            },
		            process: function () {
		                if (!q.paused && workers < q.concurrency && q.tasks.length) {
		                    var task = q.tasks.shift();
		                    if (q.empty && q.tasks.length === 0) {
		                        q.empty();
		                    }
		                    workers += 1;
		                    var next = function () {
		                        workers -= 1;
		                        if (task.callback) {
		                            task.callback.apply(task, arguments);
		                        }
		                        if (q.drain && q.tasks.length + workers === 0) {
		                            q.drain();
		                        }
		                        q.process();
		                    };
		                    var cb = only_once(next);
		                    worker(task.data, cb);
		                }
		            },
		            length: function () {
		                return q.tasks.length;
		            },
		            running: function () {
		                return workers;
		            },
		            idle: function() {
		                return q.tasks.length + workers === 0;
		            },
		            pause: function () {
		                if (q.paused === true) { return; }
		                q.paused = true;
		                q.process();
		            },
		            resume: function () {
		                if (q.paused === false) { return; }
		                q.paused = false;
		                q.process();
		            }
		        };
		        return q;
		    };

		    this.priorityQueue = function(worker, concurrency) {
		    	function _compareTasks(a, b){
	          return a.priority - b.priority;
	        };

	        function _binarySearch(sequence, item, compare) {
	          var beg = -1,
	              end = sequence.length - 1;
	          while (beg < end) {
	            var mid = beg + ((end - beg + 1) >>> 1);
	            if (compare(item, sequence[mid]) >= 0) {
	              beg = mid;
	            } else {
	              end = mid - 1;
	            }
	          }
	          return beg;
	        }

	        function _insert(q, data, priority, callback) {
				if (!q.started){
					q.started = true;
				}
				if (!_isArray(data)) {
					data = [data];
				}
				if(data.length == 0) {
				// call drain immediately if there are no tasks
					return latte_lib.setImmediate(function() {
						if (q.drain) {
							q.drain();
						}
					});
				}
				  latte_lib.forEach(data, function(task) {
				      var item = {
				          data: task,
				          priority: priority,
				          callback: typeof callback === 'function' ? callback : null
				      };

				      q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

				      if (q.saturated && q.tasks.length === q.concurrency) {
				          q.saturated();
				      }
				      latte_lib.setImmediate(q.process);
				  });
				}

		        // Start with a normal queue
		        var q = _self.queue(worker, concurrency);

		        // Override push to accept second parameter representing priority
		        q.push = function (data, priority, callback) {
		          _insert(q, data, priority, callback);
		        };

		        // Remove unshift function
		        delete q.unshift;

		        return q;
		    };

		    this.cargo = function (worker, payload) {
		        var working     = false,
		            tasks       = [];

		        var cargo = {
		            tasks: tasks,
		            payload: payload,
		            saturated: null,
		            empty: null,
		            drain: null,
		            drained: true,
		            push: function (data, callback) {
		                if (!latte_lib.isArray(data)) {
		                    data = [data];
		                }
		                latte_lib.forEach(data, function(task) {
		                    tasks.push({
		                        data: task,
		                        callback: typeof callback === 'function' ? callback : null
		                    });
		                    cargo.drained = false;
		                    if (cargo.saturated && tasks.length === payload) {
		                        cargo.saturated();
		                    }
		                });
		                latte_lib.setImmediate(cargo.process);
		            },
		            process: function process() {
		                if (working) return;
		                if (tasks.length === 0) {
		                    if(cargo.drain && !cargo.drained) cargo.drain();
		                    cargo.drained = true;
		                    return;
		                }

		                var ts = typeof payload === 'number'
		                            ? tasks.splice(0, payload)
		                            : tasks.splice(0, tasks.length);

		                var ds = latte_lib.map(ts, function (task) {
		                    return task.data;
		                });

		                if(cargo.empty) cargo.empty();
		                working = true;
		                worker(ds, function () {
		                    working = false;

		                    var args = arguments;
		                    latte_lib.forEach(ts, function (data) {
		                        if (data.callback) {
		                            data.callback.apply(null, args);
		                        }
		                    });

		                    process();
		                });
		            },
		            length: function () {
		                return tasks.length;
		            },
		            running: function () {
		                return working;
		            }
		        };
		        return cargo;
		    };

		    var _console_fn = function (name) {
		        return function (fn) {
		            var args = Array.prototype.slice.call(arguments, 1);
		            fn.apply(null, args.concat([function (err) {
		                var args = Array.prototype.slice.call(arguments, 1);
		                if (typeof console !== 'undefined') {
		                    if (err) {
		                        if (console.error) {
		                            console.error(err);
		                        }
		                    }
		                    else if (console[name]) {
		                        latte_lib.forEach(args, function (x) {
		                            console[name](x);
		                        });
		                    }
		                }
		            }]));
		        };
		    };
		    this.log = _console_fn('log');
	 		this.dir = _console_fn('dir');

	 		this.memoize = function (fn, hasher) {
		        var memo = {};
		        var queues = {};
		        hasher = hasher || function (x) {
		            return x;
		        };
		        var memoized = function () {
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            var key = hasher.apply(null, args);
		            if (key in memo) {
		                latte_lib.nextTick(function () {
		                    callback.apply(null, memo[key]);
		                });
		            }
		            else if (key in queues) {
		                queues[key].push(callback);
		            }
		            else {
		                queues[key] = [callback];
		                fn.apply(null, args.concat([function () {
		                    memo[key] = arguments;
		                    var q = queues[key];
		                    delete queues[key];
		                    for (var i = 0, l = q.length; i < l; i++) {
		                      q[i].apply(null, arguments);
		                    }
		                }]));
		            }
		        };
		        memoized.memo = memo;
		        memoized.unmemoized = fn;
		        return memoized;
		    };

		    this.unmemoize = function (fn) {
				return function () {
					return (fn.unmemoized || fn).apply(null, arguments);
				};
		    };

		    this.times = function (count, iterator, callback) {
		        var counter = [];
		        for (var i = 0; i < count; i++) {
		            counter.push(i);
		        }
		        return _self.map(counter, iterator, callback);
		    };

		    this.timesSeries = function (count, iterator, callback) {
		        var counter = [];
		        for (var i = 0; i < count; i++) {
		            counter.push(i);
		        }
		        return _self.mapSeries(counter, iterator, callback);
		    };

		    /**
		    	@method seq
		    	@static
		    	@async
		    	@param  {function[]}     functions
		    	@return {function}
		    	@since 0.0.1
				@example

					var async = require("latte_lib").async;
					var fun = async.seq(function(a, callback) {
						log("1",a);//2
						callback(null, a+1, a-1);
					}, function(data1, data2, callback) {
						log("2",data1,data2);//3,1
						callback("is 2", (data1 + data2 + 2) / (data1- data2 + 2) );
					});
					fun(2, function(err,b,c) {
						log(err ,b,c);//is 2, 1.5
					});

		    */

		    this.seq = function (/* functions... */) {
		        var fns = arguments;
		        return function () {
		            var that = this;
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            _self.reduce(fns, args, function (newargs, fn, cb) {
		                fn.apply(that, newargs.concat([function () {
		                    var err = arguments[0];
		                    var nextargs = Array.prototype.slice.call(arguments, 1);
		                    cb(err, nextargs);
		                }]))
		            },
		            function (err, results) {
		                callback.apply(that, [err].concat(results));
		            });
		        };
		    };

		    this.compose = function (/* functions... */) {
		    	//颠倒参数
		      return _self.seq.apply(null, Array.prototype.reverse.call(arguments));
		    };

		    var _applyEach = function (eachfn, fns /*args...*/) {
		        var go = function () {
		            var that = this;
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            return eachfn(fns, function (fn, cb) {
		                fn.apply(that, args.concat([cb]));
		            },
		            callback);
		        };
		        if (arguments.length > 2) {
		            var args = Array.prototype.slice.call(arguments, 2);
		            return go.apply(this, args);
		        }
		        else {
		            return go;
		        }
		    };
		    this.applyEach = doParallel(_applyEach);
	    	this.applyEachSeries = doSeries(_applyEach);

	    	/**
	    		循环执行出现错误停止

	    		@method forever
				@static
				@param   fn   {function}  循环执行到函数
				@param   callback  {function}  循环执行出现错误之后回调函数
				@example

					var async = require("latte_lib").async;
					var i = 0;
					async.forever(function(next) {
						if(++i == 3)  {
							next("is 3");
						}else{
							log("forever", i);
							next();
						};

					}, function(err) {
						log(err);
					});
	    	*/
	    	this.forever = function (fn, callback) {
		        function next(err) {
		            if (err) {
		                if (callback) {
		                    return callback(err);
		                }
		                throw err;
		            }
		            fn(next);
		        }
		        next();
		    };
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_lib/coding/base64", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
			/**
				@namespace latte_lib
				@module coding
			  @class base64
			 */
			(function() {
				var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

					/**
						@method encode
						@param {String} input
						@return {String} output
						@example
							var Base64 = require("latte_lib").base64;
							log(Base64.encode("latte的世界"));
					*/
					this.encode = function (input) {
							var output = "";
							var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
							var i = 0;
							input = require("./utf8").encode(input);
							//input = _utf8_encode(input);
							while (i < input.length) {
									chr1 = input.charCodeAt(i++);
									chr2 = input.charCodeAt(i++);
									chr3 = input.charCodeAt(i++);
									enc1 = chr1 >> 2;
									enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
									enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
									enc4 = chr3 & 63;
									if (isNaN(chr2)) {
											enc3 = enc4 = 64;
									} else if (isNaN(chr3)) {
											enc4 = 64;
									}
									output = output +
									_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
									_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
							}
							return output;
					}

					/**
						@method decode
						@param {String} input
						@return {String} output
						@example
							var Base64 = require("latte_lib").base64;
							log(Base64.decode("bGF0dGXnmoTkuJbnlYw="));
					*/
					this.decode = function (input) {
							var output = "";
							var chr1, chr2, chr3;
							var enc1, enc2, enc3, enc4;
							var i = 0;
							input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
							while (i < input.length) {
									enc1 = _keyStr.indexOf(input.charAt(i++));
									enc2 = _keyStr.indexOf(input.charAt(i++));
									enc3 = _keyStr.indexOf(input.charAt(i++));
									enc4 = _keyStr.indexOf(input.charAt(i++));
									chr1 = (enc1 << 2) | (enc2 >> 4);
									chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
									chr3 = ((enc3 & 3) << 6) | enc4;
									output = output + String.fromCharCode(chr1);
									if (enc3 != 64) {
											output = output + String.fromCharCode(chr2);
									}
									if (enc4 != 64) {
											output = output + String.fromCharCode(chr3);
									}
							}
							output = require("./utf8").decode(output);
							//output = _utf8_decode(output);
							return output;
					}


			}).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/coding/hex", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		(function() {
			this.encode = function(string) {
			 	var HEX = "0123456789ABCDEF",  
				radix = 16,  
				len = string.length,  
				encodeStr = "";  
				for (var i = 0; i < len; i++) {  
					var num = parseInt(string.charCodeAt(i), 10);  
					encodeStr += "%" + Math.floor(num / radix) + HEX.charAt(num % radix);  
				}  
				return encodeStr;  
			}
			this.decode = function(string) {
				var arr = string.split("%"),  
				str = "";
				for (var i = 1; arr[i]; i++) {  
					str += String.fromCharCode(parseInt(arr[i], 16));  
				}  
				return str; 
			}
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) { 'use strict';
	define("latte_lib/coding/utf8", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		/**
		*	@class utf8
		*	@namespace latte_lib
		*	@module coding
		*
		*/
		(function() {
			/**
			*	@property version
			*	@type String
			*/
			this.version = "0.0.1"
			var stringFromCharCode = String.fromCharCode;
			/**
			*	@method ucs2encode
			*	@param {int[]} array   8byte int[]
			*	@return {string} output   utf8String
			*	@since 0.0.1
			*	@sync
			*	@static
			*	@demo utf8.html {utf测试}
			*	@example
					var Utf8 = require("latte_lib").utf8;
					console.log(Utf8.ucs2encode([108,97,116,116,101,30340,19990,30028])) ;//"latte的世界"
			*/
			var ucs2encode = this.ucs2encode = function(array) {
				var length = array.length;
				var index = -1;
				var value;
				var output = '';
				while (++index < length) {
					value = array[index];
					if (value > 0xFFFF) {
						value -= 0x10000;
						output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
						value = 0xDC00 | value & 0x3FF;
					}
					output += stringFromCharCode(value);
				}
				return output;
			}
			/**
			*	@method ucs2decode
			*	@param {string} str    utf8String
			*	@return {int[]} output   8byte int[]
			*	@since 0.0.1
			*	@sync
			*	@static
			*	@example
					var Utf8 = require("latte_lib").utf8;
					console.log(Utf8.ucs2decode("latte的世界")) ;//[108,97,116,116,101,30340,19990,30028]
			*/
			var ucs2decode = this.ucs2decode = function (string) {
				var output = [];
				var counter = 0;
				var length = string.length;
				var value;
				var extra;
				while (counter < length) {
					value = string.charCodeAt(counter++);
					if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
						// high surrogate, and there is a next character
						extra = string.charCodeAt(counter++);
						if ((extra & 0xFC00) == 0xDC00) { // low surrogate
							output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
						} else {
							// unmatched surrogate; only append this code unit, in case the next
							// code unit is the high surrogate of a surrogate pair
							output.push(value);
							counter--;
						}
					} else {
						output.push(value);
					}
				}
				return output;
			}
			function createByte(codePoint, shift) {
				return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
			}

			function encodeCodePoint(codePoint) {
				if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
					return stringFromCharCode(codePoint);
				}
				var symbol = '';
				if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
					symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
				}
				else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
					symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
					symbol += createByte(codePoint, 6);
				}
				else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
					symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
					symbol += createByte(codePoint, 12);
					symbol += createByte(codePoint, 6);
				}
				symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
				return symbol;
			}
			/**
			*
			*	@method encode
			*	@param {string}  str   utf8string
			*	@return {string} byteString
			*	@since 0.0.1
			*   @static
			*	@sync
			*	@example
					var Utf8 = require("latte_lib").utf8;
					log(Utf8.encode("latte的世界")) ;//latteçä¸ç
			*
			*/
			var utf8encode = this.encode =  function(str) {
				var codePoints = ucs2decode(str);
				// console.log(JSON.stringify(codePoints.map(function(x) {
				// 	return 'U+' + x.toString(16).toUpperCase();
				// })));

				var length = codePoints.length;
				var index = -1;
				var codePoint;
				var byteString = '';
				while (++index < length) {
					codePoint = codePoints[index];
					byteString += encodeCodePoint(codePoint);
				}
				return byteString;
			}


			function readContinuationByte() {
				if (byteIndex >= byteCount) {
					throw Error('Invalid byte index');
				}

				var continuationByte = byteArray[byteIndex] & 0xFF;
				byteIndex++;

				if ((continuationByte & 0xC0) == 0x80) {
					return continuationByte & 0x3F;
				}

				// If we end up here, it’s not a continuation byte
				throw Error('Invalid continuation byte');
			}

			function decodeSymbol() {
				var byte1;
				var byte2;
				var byte3;
				var byte4;
				var codePoint;

				if (byteIndex > byteCount) {
					throw Error('Invalid byte index');
				}

				if (byteIndex == byteCount) {
					return false;
				}

				// Read first byte
				byte1 = byteArray[byteIndex] & 0xFF;
				byteIndex++;

				// 1-byte sequence (no continuation bytes)
				if ((byte1 & 0x80) == 0) {
					return byte1;
				}

				// 2-byte sequence
				if ((byte1 & 0xE0) == 0xC0) {
					var byte2 = readContinuationByte();
					codePoint = ((byte1 & 0x1F) << 6) | byte2;
					if (codePoint >= 0x80) {
						return codePoint;
					} else {
						throw Error('Invalid continuation byte');
					}
				}

				// 3-byte sequence (may include unpaired surrogates)
				if ((byte1 & 0xF0) == 0xE0) {
					byte2 = readContinuationByte();
					byte3 = readContinuationByte();
					codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
					if (codePoint >= 0x0800) {
						return codePoint;
					} else {
						throw Error('Invalid continuation byte');
					}
				}

				// 4-byte sequence
				if ((byte1 & 0xF8) == 0xF0) {
					byte2 = readContinuationByte();
					byte3 = readContinuationByte();
					byte4 = readContinuationByte();
					codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
						(byte3 << 0x06) | byte4;
					if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
						return codePoint;
					}
				}

				throw Error('Invalid UTF-8 detected');
			}

			var byteArray;
			var byteCount;
			var byteIndex;
			/**
			*	@method decode
			*	@sync
			*	@static
			*	@param {string}  byteString   bytes
			*	@return {string}
			*	@since 0.0.1
			*	@example
			*		var Utf8;
			*
			*		var Utf8 = require("latte_lib").utf8;
			*
			*
			*		console.log(Utf8.decode("latteçä¸ç")) ; //latte的世界
			*/
			var utf8decode = this.decode = function(byteString) {
				byteArray = ucs2decode(byteString);
				byteCount = byteArray.length;
				byteIndex = 0;
				var codePoints = [];
				var tmp;
				while ((tmp = decodeSymbol()) !== false) {
					codePoints.push(tmp);
				}
				return ucs2encode(codePoints);
			}



			// private method for UTF-8 encoding
			var _utf8_encode = function (string) {
					string = string.replace(/\r\n/g,"\n");
					var utftext = "";
					for (var n = 0; n < string.length; n++) {
							var c = string.charCodeAt(n);
							if (c < 128) {
									utftext += String.fromCharCode(c);
							} else if((c > 127) && (c < 2048)) {
									utftext += String.fromCharCode((c >> 6) | 192);
									utftext += String.fromCharCode((c & 63) | 128);
							} else {
									utftext += String.fromCharCode((c >> 12) | 224);
									utftext += String.fromCharCode(((c >> 6) & 63) | 128);
									utftext += String.fromCharCode((c & 63) | 128);
							}

					}
					return utftext;
			}

			// private method for UTF-8 decoding
			var _utf8_decode = function (utftext) {
					var string = "";
					var i = 0;
					var c = c1 = c2 = 0;
					while ( i < utftext.length ) {
							c = utftext.charCodeAt(i);
							if (c < 128) {
									string += String.fromCharCode(c);
									i++;
							} else if((c > 191) && (c < 224)) {
									c2 = utftext.charCodeAt(i+1);
									string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
									i += 2;
							} else {
									c2 = utftext.charCodeAt(i+1);
									c3 = utftext.charCodeAt(i+2);
									string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
									i += 3;
							}
					}
					return string;
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/debug", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var getLocation = function(str) {
				var at = str.toString().split("\n")[2];
				var data = at.substring(at.indexOf("(")+1, at.indexOf(")"));
				return data;
			}
		var disabled = window? !window.debug: process.argv.indexOf("-debug") == -1;
		var loggers = {};
		var logger = {};
		["log", "info", "error","warn"].forEach(function(type) {
			logger[type] = function() {
				if(disabled) {
					return;
				}
				var debug = new Error("debug");
				console[type].apply( console[type], [ getLocation(debug.stack)].concat( Array.prototype.slice.call(arguments)));
			}
		});
		module.exports = logger;

	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/events", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var events;
		if(window) {
			/**
				@class events
				@namespace latte_lib
				@module basic
			*/
			var events = function() {
				this._events = this._events || {};
			};
			(events.interface = function() {
				/**
					@method on
					@public
					@param {String} event
					@param {Function} fn
					@return {events} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						events.on("hello", function() {
							log("latte");
						});
						events.emit("hello");
				*/
				this.on = this.addEventListener = function(event , fn) {
					this._events = this._events || {};
					(this._events[event] = this._events[event] || [])
						.push(fn);
					return this;
				};
				/**
					@method once
					@public
					@param {String} event
					@param {Function} fn
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						events.once("hello", function() {
							log("latte");
						});
						events.emit("hello");
						events.emit("hello");
				*/
				this.once = function(event, fn) {
					var self = this;
					this._events = this._events || {};

					function on() {
						self.off(event, on);
						fn.apply(this, arguments);
					}

					on.fn = fn;
					this.on(event, on);
					return this;
				};
				/**
					@method off
					@public
					@param {String} event
					@param {Function} fn
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						events.once("hello", fun);
						events.emit("hello", fun);
				*/
				this.off =
				this.removeListener =
				this.removeAllListeners =
				this.removeEventListener = function(event, fn){
				  this._events = this._events || {};

				  // all
				  if (0 == arguments.length) {
				    this._events = {};
				    return this;
				  }

				  // specific event
				  var callbacks = this._events[event];
				  if (!callbacks) return this;

				  // remove all handlers
				  if (1 == arguments.length) {
				    delete this._events[event];
				    return this;
				  }

				  // remove specific handler
				  var cb;
				  for (var i = 0; i < callbacks.length; i++) {
				    cb = callbacks[i];
				    if (cb === fn || cb.fn === fn) {
				      callbacks.splice(i, 1);
				      break;
				    }
				  }
				  return this;
				};
				/**
					@method emit
					@public
					@param {String} event
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						events.on("hello", fun);
						event.emit("hello")
				*/
				this.emit = function(event){
					this._events = this._events || {};
					var args = [].slice.call(arguments, 1)
					, callbacks = this._events[event];

					if (callbacks) {
						callbacks = callbacks.slice(0);
						for (var i = 0, len = callbacks.length; i < len; ++i) {
						  callbacks[i].apply(this, args);
						}
					}

					return this;
				};
				/**
					@method listeners
					@public
					@param {String} event
					@return {Function[]}
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						log(events.listeners("hello"));
				*/
				this.listeners = function(event){
					this._events = this._events || {};
					return this._events[event] || [];
				};
				/**
					@method hasListeners
					@public
					@param {String} event
					@return {Bool}
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						log(events.hasListeners("hello"));
				*/
				this.hasListeners = function(event){
					return !! this.listeners(event).length;
				};
			}).call(events.prototype);
		}else{
			events = require("events").EventEmitter;
		}
		module.exports = events;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_lib/format", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		var latte_lib = require("./lib");
		/**
			@namespace latte_lib
			@class format
			@module basic
		*/
		(function() {
			var _self = this;
			/**
					@property ISO8601_FORMAT
					@type String
			*/
			this.ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
			/**
				@property ISO8601_WITH_TZ_OFFSET_FORMAT
				@type String
			*/
			this.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
			/**
				@property DATETIME_FORMAT
				@type String
			*/
			this.DATETIME_FORMAT = "hh:mm:ss.SSS";
				function padWithZeros(vNumber, width) {
					var numAsString =  vNumber + "";
					while(numAsString.length < width) {
						numAsString = "0" + numAsString;
					}
					return numAsString;
				}
				function addZero(vNumber) {
					return padWithZeros(vNumber, 2);
				}
				function offset(date) {
					var os = Math.abs(date.getTimezoneOffset());
					var h = String(Math.floor(os/60));
					var m = String(os%60);
					if(h.length == 1) {
						h = "0" + h;
					}
					if(m.length == 1) {
						m = "0" + m;
					}
					return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
				}
				/**
					@method getDateReplace
					@public
					@static
					@sync
					@param {Date} date
					@return {Object}
					@example
						var Format = require("latte_lib").format;
						var date = new Date();
						log(Format.getDateReplace(date));
				*/
				this.getDateReplace = function(date, prefix, postfix) {
					prefix = prefix ||  "";
					postfix = postfix || "";
					var vDay = addZero(date.getDate());
					var vMonth = addZero(date.getMonth() + 1);
					var vYearLong = addZero(date.getFullYear());
					var vYearShort = addZero(date.getFullYear().toString().substring(2,4));
					//var vYear = (format.indexOf("yyyy") > -1 ? vYearLong: vYearShort);
					var vHour = addZero(date.getHours());
					var vMinute = addZero(date.getMinutes());
					var vSecond = addZero(date.getSeconds());
					var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
					var vTimeZone = offset(date);

					var result = {};
					result[prefix + "dd" + postfix] = vDay;
					result[prefix + "MM" + postfix] = vMonth;
					result[prefix + "yyyy" + postfix] = vYearLong;
					result[prefix + "y{1,4}" + postfix] = vYearShort;
					result[prefix + "hh" + postfix] = vHour;
					result[prefix + "mm" + postfix] = vMinute;
					result[prefix + "ss" + postfix] = vSecond;
					result[prefix + "SSS" + postfix] = vMillisecond;
					result[prefix + "O" + postfix] = vTimeZone;
					return result;
				}
				/**
					@method dateFormat
					@public
					@static
					@sync
					@param {String} format
					@param {Date} date
					@return {String} formatted
					@example
						var Format = require("latte_lib").format;
						var date = new Date();
						log(Format.dateFormat(Format.ISO8601_FORMAT, date));
				*/
			this.dateFormat = function(format, date) {
				if(!date) {
					date = format || new Date();
					format = exports.ISO8601_FORMAT;
				}
				var formatted = format;
				var json = _self.getDateReplace(date);
				latte_lib.jsonForEach(json, function(key, value) {
					formatted = formatted.replace(new RegExp(key,"g"), value);
				});
				return formatted;
			}
				var repeatStr = function(str, times) {
					var newStr = [];
					if(times > 0) {
						for(var i = 0; i < times; i++) {
							newStr.push(str);
						}
					}
					return newStr.join("");
				}
				var objFormat = function(object, level, jsonUti, isInArray) {
					var tab = isInArray ? repeatStr(jsonUti.t, level - 1): "";
					if(object === null || object === undefined) {
						return tab + "null";
					}
					switch(latte_lib.getClassName(object)) {
						case "array":
							var paddingTab = repeatStr(jsonUti.t , level - 1);
							var temp = [ jsonUti.n + paddingTab + "[" + jsonUti.n];
							var tempArrValue = [];
							for(var i = 0 , len = object.length; i < len; i++ ) {
								tempArrValue.push(objFormat(object[i], level + 1, jsonUti, true));
							}
							temp.push(tempArrValue.join("," + jsonUti.n));
							temp.push(jsonUti.n + paddingTab + "] ");
							return temp.join("");
						break;
						case "object":
							var currentObjStrings = [];
							for(var key in object) {
								if(object[key] == undefined) {
									continue;
								}
								var temp = [];
								var paddingTab = repeatStr(jsonUti.t, level);
								temp.push(paddingTab);
								temp.push("\"" + key +"\" : ");
								var value = object[key];
								temp.push(objFormat(value, level + 1, jsonUti));
								currentObjStrings.push(temp.join(""));
							}
							return (level > 1 && !isInArray ? jsonUti.n : "")
								+ repeatStr(jsonUti.t, level - 1) + "{" + jsonUti.n
								+ currentObjStrings.join("," + jsonUti.n)
								+ jsonUti.n + repeatStr(jsonUti.t , level - 1) + "}";
						break;
						case "number":
							return tab + object.toString();
						break;
						case "boolean":
							return tab + object.toString().toLowerCase();
						break;
						case "function":
							return "[Function]";
						break;
						default:
							return tab + ("\"" + object.toString() + "\"");
						break;
					}
				}
			/**
				@method jsonFormat
				@public
				@static
				@param {Object}
				@param {Object} default { n: "\n", t: "\t"}
				@return {String}
				@example
					var Format = require("latte_lib").format;
					log(Format.jsonFormat({
						a: "1",
						b: 2,
						c: [3],
						d: {
							e: 4
					}
				}));

			*/
				var defaultUti = { n: "\n", t: "\t"};
			this.jsonFormat = function(object, jsonUti) {
				jsonUti = latte_lib.merger(defaultUti, jsonUti);
				try {
					return objFormat(object, 1, jsonUti);
				}catch(e) {
					throw object;
					return JSON.stringify(object);
				}
			}
			/**
			 * @method templateStringFormat
				 @sync
				 @public
				 @param {String} template
				 @param  {Object} options
				 @return {String} data
				 @example
						var Format = require("latte_lib").format;
						log(Format.templateStringFormat("hello, latte_lib", { name: "latte"}));
			 */
			this.templateStringFormat = function(template, options) {
				var data = template;
				for(var i in options) {
					data = data.replace(new RegExp("{{"+i+"}}","igm"), options[i]);
				}
				return data;
			}
			this.templateJsonFormat = function(template, options) {
						var template = JSON.stringify(template);
						var data = _self.templateStringFormat(template, options);
						return JSON.parse(data);
			}
		}).call(module.exports);
  });
 })(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
  define("latte_lib/index", ["require", "exports", "module", "window"],
  function(require, exports, module, window){
      /**
        @main
      */
      module.exports = require("./lib");
      (function() {
        if(!window) {
          this.fs = require("./old/fs");
        }
        this.utf8 = require("./coding/utf8");
        this.async = require("./async");
        this.events = require("./events");
        this.format = require("./format");
        this.removeIdle = require("./old/removeIdle");
        this.queue = require("./old/queue");
        this.base64 = require("./coding/base64");
        this.debug = require("./debug");
        this.xhr = require("./old/xhr");
      }).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/lib", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		/**
		*	@namespace latte_lib
		*	@class lib
			@module basic
		*
		*/
		(function() {
			var _self = this;
			/**
			*	@method nextTick
			*	@param {function} callback
			*	@async
			*	@static
			*	@all
			*	@example
					(function() {
						require("latte_lib").nextTick(function(){
							console.log("a");
						});
						console.log("b");
					})();
					//b
					//a
			*/
			this.setImmediate = this.nextTick = (function() {
				if(typeof process === "undefined" || !(process.nextTick)) {
	                if(window && typeof window.setImmediate === "function") {
	                    return window.setImmediate;
	                }else {
	                    return function(fn) {
	                        setTimeout(fn, 0);
	                    }
	                }
	            } else {
	                return process.nextTick;
	            }
			})();
			/**
			*
			*	@method inherits
			*	@param {class} ctor     class
			*	@param {class} superCtor    parentClass
			*	@sync
			*	@all
			*	@static
			*	@public
			*	@since 0.0.1
			*	@example
					var latte_lib = require("latte_lib");
					var A = function() {
						this.name = "a";
					};
					(function() {
						this.getName = function() {
							return this.name;
						}
					}).call(A.prototype);
					var B = function() {
						this.name = "b";
					}
					latte_lib.inherits(B, A);
					var b = new B();
					var a = new A();
					log(b.getName());//"b"
					log(a.getName());//"a";
			*/
			this.inherits = function(ctor, superCtor) {
				if(typeof Object.create === "function") {
	                ctor.super_ = superCtor
	                ctor.prototype = Object.create(superCtor.prototype, {
	                  constructor: {
	                    value: ctor,
	                    enumerable: false,
	                    writable: true,
	                    configurable: true
	                  }
	                });
	            } else {
	                ctor.super_ = superCtor
	                var TempCtor = function () {}
	                TempCtor.prototype = superCtor.prototype
	                ctor.prototype = new TempCtor()
	                ctor.prototype.constructor = ctor
	            }
			}
			/**
			*	@method forEach
			*	@static
			* 	@sync
			*	@all
			*	@since 0.0.1
			*	@public
			*	@param {class} ctor     class
			*	@param {class} superCtor    parentClass
			*	@example
					var latte_lib = require("latte_lib");
					var array = [1,2,3,4];
					var all = 0;
					latte_lib.forEach(array, function(key) {
							all += key;
					});
					log(all);//20
			*/
			this.forEach = function(arr, iterator) {
				if(arr.forEach) {
					return arr.forEach(iterator);
				}
				for(var i = 0 ,len = arr.length; i < len; i++) {
					iterator(arr[i], i, arr);
				}
			}
			/**
			*	@method keys
			*	@static
			*	@sync
			*	@all
			*	@since 0.0.1
			*	@public
			*	@param   {object} obj
			*	@return  {string[]} stringArray
			*	@example
					var latte_lib = require("latte_lib");
					var obj = { a: "a", b: "b"};
					var keys = latte_lib.keys(obj);
					log(keys);//["a","b"]
			*/
			this.keys = function(obj) {
				if(Object.keys) {
					return Object.keys(obj);
				}
				var keys = [];
				for(var k in obj) {
					if(obj.hasOwnProperty(k)) {
						keys.push(k);
					}
				}
				return keys;
			}

			/**
			* 	@method copyArray
			* 	@static
			*	@param {array} arr
			*	@return {array}
			*	@sync
			*	@public
			*	@since 0.0.1
			*
			*	@example
					var latte_lib = require("latte_lib");
					var array = ["1", "a"];
					var cArray = latte_lib.copyArray(array);
					log(cArray);//["1", "a"]
			*/
			this.copyArray = function(arr) {
				return arr.concat([]);
			}

			/**
			* 	@method indexOf
			* 	@static
			*	@param {object[] || string} arr
			*	@param {object}  obj
			*	@return {int}
			*	@sync
			*	@public
			*	@since 0.0.1
			*
			*	@example
					var latte_lib = require("latte_lib");
					var array = ["1", "a"];
					var cArray = latte_lib.indexOf(array, "1");
					log(cArray);//0
			*/
			this.indexOf = function(arr, obj) {
				if(arr.indexOf) return arr.indexOf(obj);
				for(var i = 0, len = arr.length; i < len; i++) {
					if(arr[i] === obj) return i;
				}
				return -1;
			}
			/**
				@method removeArray
				@static
				@param {object[]} 	arr
				@param {int}   start      0 start
				@param {int}	end
				@public
				@since 0.0.1
				@sync
				@return {object[]}  as
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.removeArray(arr, 2,3);
					log(as);//[1,2,5]
					log(arr);//[1,2,3,4,5]
			*/
			this.removeArray = function(arr, start, end) {
				var as = _self.copyArray(arr);
				_self.removeLocalArray(as, start, end);
				return as;
			}

			/**
			* 	@method removeLocalArray
			* 	@static
			*	@param {object[]} arr
			*	@param {int} start
			*	@param {int} end
			*	@public
			*	@since 0.0.1
			*	@sync
			*	@return {object[]} arr
				@example
					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.removeLocalArray(arr, 2,3);
					log(as);//[1,2,5]
					log(arr);//[1,2,5]
			*/
			this.removeLocalArray = function(arr, start, end) {
				/**
					var rest = array.slice((end || start)+1);
					array.length = start < 0? array.length + start : start;
					return array;
				*/
				end = end || start;
				arr.splice(start , end - start+1);
				return arr;
			}
			/**
				@method inserLocalArray
				@static
				@public
				@sync
				@since 0.0.1
				@param {object[]} arr
				@param {int} index
				@param {object} obj
				@return {object[]} arr
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.inserLocalArray(arr, 2, 9);
					log(as);//[1,2,9,3,4,5]
					log(arr);//[1,2,9,3,4,5]
			*/
			this.inserLocalArray = function(arr, index, obj) {
				/*
					var rest = [node].concat(array.slice(index));
					array.length = index < 0? array.length + index: index;
					array.push.apply(array, rest);
					return array;
				*/
				arr.splice(index , 0 , obj);
				return arr;
			}

			/**
				@method copy
				@static
				@public
				@sync
				@since 0.0.1
				@param {object} obj
				@return {object} obj
				@example

					var latte_lib = require("latte_lib");
					var copy = latte_lib.copy({
						a: function() {

						},
						b: "1"
					});
					console.log(copy);
					//{ b : "1" }
			*/
			this.copy = function(obj) {
				return JSON.parse(JSON.stringify(obj));
			}
			/**
				@method clone
				@static
				@public
				@sync
				@since 0.0.1
				@param {object} obj
				@return {object} obj
				@example

					var latte_lib = require("latte_lib");
					var o = {
						a: function() {

						},
						b: "1"
					};
					var clone = latte_lib.clone(o);
					o.b = "2";
					console.log(clone);//{ a: function(){}, b: "1"}
					console.log(o);    //{ a: function(){}, b: "2"}
			*/
			this.clone = function(obj) {
				var o = {};
				for(var i in obj) {
					if(obj.hasOwnProperty(i)) {
						o[i] = obj[i];
					}
				}
				return o;
			}
			/**
				@method reduce
				@static
				@public
				@sync
				@since 0.0.1
				@param {object[]} arr
				@param {function} iterator
				@param {obj}  memo
				@return {obj} memo
				@example

					var latte_lib = require("latte_lib");
					var array = [1,2,3,4];
					var c = 0;
					var d = latte_lib.reduce(array, function(c, x, i, a) {
						return c + x;
					}, c);
					log(d);//10;
					log(c);//0;

			*/
			this.reduce = function(arr, iterator, memo) {
				if(arr.reduce) {
					return arr.reduce(iterator, memo);
				}
				_self.forEach(arr, function(x, i, a) {
					memo = iterator(memo, x, i, a);
				});
				return memo;
			}

			/**
				@method map
				@static
				@public
				@sync
				@param {object[]} arr
				@param {function} iterator
				@return {object[]} results;
				@since 0.0.1
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4];
					var as = latte_lib.map(arr, function(o) {
						return o+1;
					});
					log(as);//[2,3,4,5]
			*/
			this.map = function(arr, iterator) {
				if(arr.map) {
					return arr.map(iterator);
				}
				var results = [];
				_self.forEach(arr, function(x, i, a) {
					results.push(iterator(x, i, a));
				});
				return results;
			}
			/**
				@method jsonForEach
				@param {json} data
				@param {function} iterator
				@static
				@public
				@example
					var latte_lib = require("latte_lib");
					var data = {
						a: 1,
						b: "c",
						c: [1,2,3]
					};
					latte_lib.jsonForEach(data, function(key, value) {
						log(key, value);
					});
					//a   1
					//b   c
					//c   [1,2,3]
			*/
			this.jsonForEach = function(data, iterator) {
				this.keys(data).forEach(function(key) {
					iterator(key, data[key]);
				});
			}
			/**
				@method getChar
				@param {string} str
				@param {int} index
				@return  {string}
				@sync
				@public
				@static
				@example

					var latte_lib = require("latte_lib");
					var str = "abcde";
					var char = latte_lib.getChar(str, 1);
					log(char);//b
			*/
			this.getChar = function(str, index) {
				var strs = str.split("");
				return strs[index];
			}
			if(!Function.prototype.bind) {
				Function.prototype.bind = function(thisArg) {
					var args = Array.prototype.slice.call(arguments, 1);
					var self = this;
					return function() {
						self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
					}
				}
			}

			/**
				@method	isArray
				@public
				@static
				@sync
				@param {objct}  obj
				@return {bool}
				@example

					var latte_lib = require("latte_lib");
					log( latte_lib.isArray(1) ); //false
					log( latte_lib.isArray([1,2,3]) ); //true
			*/
			this.isArray = function(obj) {
				if(Array.isArray) {
					return Array.isArray(obj);
				}else{
					throw "no handle isArray";
				}
			};

			/**
				@method isDate
				@static
				@public
				@sync
				@param {objct}  obj
				@return {bool}
				@example

					var latte_lib = require("latte_lib");
					log( latte_lib.isDate(1) ); //false
					var date = new Date();
					log( latte_lib.isDate(date) );	//true
			*/
			this.isDate = function(obj) {
				return obj.constructor == Date;
			};

			["String", "Function", "Boolean", "Number"].forEach(function(className) {
				_self["is"+className] = function(obj) {
	        		return typeof(obj) == className.toLowerCase();
	        	}
			});

			this.getClassName = function(obj) {
				var allClass = ["Array", "String", "Number", "Date", "Boolean","Function"];
				for(var i = 0, len = allClass.length; i < len; i++) {
					if(_self["is"+allClass[i]](obj)) {
						return allClass[i].toLowerCase();
					}
				}
				return "object";
			}


			/**
				@method merger
				@sync
				@static
				@public
				@param {object} master
				@param {...object} arguments{1, -1}
				@return {object} master
				@example

					var latte_lib = require("latte_lib");
					var a = latte_lib.merger({
						a: 1
					}, {
						b: 2
					});
					log(a);// {a: 1, b: 2}
			*/
			this.merger = function(master) {
				var master = _self.clone(master);
				Array.prototype.slice.call(arguments, 1).forEach(function(child) {
					if(!child) { return; }
					Object.keys(child).forEach(function(key) {
						master[key] = child[key];
					});
				});
				return master;
			}
			this.getErrorString = function(err) {
				if(err.stack) {
					return err.stack.toString();
				}else if(latte_lib.isString(err)) {
					return err.toString();
				}else{
						var errorString;
						try {
								errorString = JSON.stringify(err);
						}catch(e){
								var Util = require("util");
								errorString = Util.inspect(err);
						}
						return errorString;
				}
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/blobBuilder", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var view = window;
		view.URL = view.URL || view.webkitURL;
		// if (view.Blob && view.URL) {
		// 	try {
		// 		new Blob;
		// 		return;
		// 	} catch (e) {}
		// }

		// Internally we use a BlobBuilder implementation to base Blob off of
		// in order to support older browsers that only have BlobBuilder
		var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
			var
				  get_class = function(object) {
					return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
				}
				, FakeBlobBuilder = function BlobBuilder() {
					this.data = [];
				}
				, FakeBlob = function Blob(data, type, encoding) {
					this.data = data;
					this.size = data.length;
					this.type = type;
					this.encoding = encoding;
				}
				, FBB_proto = FakeBlobBuilder.prototype
				, FB_proto = FakeBlob.prototype
				, FileReaderSync = view.FileReaderSync
				, FileException = function(type) {
					this.code = this[this.name = type];
				}
				, file_ex_codes = (
					  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
					+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
				).split(" ")
				, file_ex_code = file_ex_codes.length
				, real_URL = view.URL || view.webkitURL || view
				, real_create_object_URL = real_URL.createObjectURL
				, real_revoke_object_URL = real_URL.revokeObjectURL
				, URL = real_URL
				, btoa = view.btoa
				, atob = view.atob

				, ArrayBuffer = view.ArrayBuffer
				, Uint8Array = view.Uint8Array

				, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
			;
			FakeBlob.fake = FB_proto.fake = true;
			while (file_ex_code--) {
				FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
			}
			// Polyfill URL
			if (!real_URL.createObjectURL) {
				URL = view.URL = function(uri) {
					var
						  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
						, uri_origin
					;
					uri_info.href = uri;
					if (!("origin" in uri_info)) {
						if (uri_info.protocol.toLowerCase() === "data:") {
							uri_info.origin = null;
						} else {
							uri_origin = uri.match(origin);
							uri_info.origin = uri_origin && uri_origin[1];
						}
					}
					return uri_info;
				};
			}
			URL.createObjectURL = function(blob) {
				var
					  type = blob.type
					, data_URI_header
				;
				if (type === null) {
					type = "application/octet-stream";
				}
				if (blob instanceof FakeBlob) {
					data_URI_header = "data:" + type;
					if (blob.encoding === "base64") {
						return data_URI_header + ";base64," + blob.data;
					} else if (blob.encoding === "URI") {
						return data_URI_header + "," + decodeURIComponent(blob.data);
					} if (btoa) {
						return data_URI_header + ";base64," + btoa(blob.data);
					} else {
						return data_URI_header + "," + encodeURIComponent(blob.data);
					}
				} else if (real_create_object_URL) {
					return real_create_object_URL.call(real_URL, blob);
				}
			};
			URL.revokeObjectURL = function(object_URL) {
				if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
					real_revoke_object_URL.call(real_URL, object_URL);
				}
			};
			FBB_proto.append = function(data/*, endings*/) {
				var bb = this.data;
				// decode data to a binary string
				if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
					var
						  str = ""
						, buf = new Uint8Array(data)
						, i = 0
						, buf_len = buf.length
					;
					for (; i < buf_len; i++) {
						str += String.fromCharCode(buf[i]);
					}
					bb.push(str);
				} else if (get_class(data) === "Blob" || get_class(data) === "File") {
					if (FileReaderSync) {
						var fr = new FileReaderSync;
						bb.push(fr.readAsBinaryString(data));
					} else {
						// async FileReader won't work as BlobBuilder is sync
						throw new FileException("NOT_READABLE_ERR");
					}
				} else if (data instanceof FakeBlob) {
					if (data.encoding === "base64" && atob) {
						bb.push(atob(data.data));
					} else if (data.encoding === "URI") {
						bb.push(decodeURIComponent(data.data));
					} else if (data.encoding === "raw") {
						bb.push(data.data);
					}
				} else {
					if (typeof data !== "string") {
						data += ""; // convert unsupported types to strings
					}
					// decode UTF-16 to binary string
					bb.push(unescape(encodeURIComponent(data)));
				}
			};
			FBB_proto.getBlob = function(type) {
				if (!arguments.length) {
					type = null;
				}
				return new FakeBlob(this.data.join(""), type, "raw");
			};
			FBB_proto.toString = function() {
				return "[object BlobBuilder]";
			};
			FB_proto.slice = function(start, end, type) {
				var args = arguments.length;
				if (args < 3) {
					type = null;
				}
				return new FakeBlob(
					  this.data.slice(start, args > 1 ? end : this.data.length)
					, type
					, this.encoding
				);
			};
			FB_proto.toString = function() {
				return "[object Blob]";
			};
			FB_proto.close = function() {
				this.size = 0;
				delete this.data;
			};
			return FakeBlobBuilder;
		}(view));

		view.Blob = function(blobParts, options) {
			var type = options ? (options.type || "") : "";
			var builder = new BlobBuilder();
			if (blobParts) {
				for (var i = 0, len = blobParts.length; i < len; i++) {
					builder.append(blobParts[i]);
				}
			}
			return builder.getBlob(type);
		};
		module.exports = BlobBuilder;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) { 'use strict';
	define("latte_lib/old/buffer", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		if(window) {
			var utf8 = require("../coding/utf8");	

			var BufferPrototype = function() {
				function checkOffset(offset, ext, length) {
				  if ((offset % 1) !== 0 || offset < 0)
				    throw new RangeError('offset is not uint');
				  if (offset + ext > length)
				    throw new RangeError('Trying to access beyond buffer length');
				}
				function checkInt(buffer, value, offset, ext, max, min) {
				  if ((value % 1) !== 0 || value > max || value < min)
				    throw TypeError('value is out of bounds');
				  if ((offset % 1) !== 0 || offset < 0)
				    throw TypeError('offset is not uint');
				  if (offset + ext > buffer.length || buffer.length + offset < 0)
				    throw RangeError('Trying to write outside buffer length');
				}
				this.slice = function(start, end) {
					var array  = Array.prototype.slice.call(this, start, end);
					return new Buffer(array);
				};
				this.readInt32LE = function(offset, noAssert) {
					if (!noAssert)
	    				checkOffset(offset, 4, this.length);
					return (this[offset]) | 
					(this[offset + 1] << 8) |
					(this[offset + 2] << 16) |
					(this[offset + 3] << 24);
				}
				this.readInt16LE = function(offset, noAssert) {
					if (!noAssert)
	    				checkOffset(offset, 2, this.length);
					var val = this[offset] | (this[offset + 1] << 8);
					return (val & 0x8000)? val | 0xFFFF0000 : val;
				}
				this.writeInt32LE = function(value, offset, noAssert) {
					if (!noAssert)
	   					checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
					this[offset] = value;
					this[offset + 1] = (value >>> 8);
					this[offset + 2] = (value >>> 16);
					this[offset + 3] = (value >>> 24);
				}
				this.writeInt16LE = function(value, offset, noAssert) {	
					if (!noAssert)
	   					checkInt(this, value, offset, 2, 0x7fff, -0x8000);		
					this[offset] = value;
					this[offset + 1] = (value >>> 8);
				}
				this.copy = function(buff, start, meStart, meEnd) {
					var meStart = meStart || 0
						, meEnd = meEnd || this.length;
					for(var i = 0,len = meEnd - meStart; i <= len; i++) {
						buff[start + i] = this[meStart + i];
					}
				}
				this.toString = function(encoding, start, end ) {
					switch(encoding) {
						/*case "base64":
						
						break;*/
						default: 
						var string = utf8.ucs2encode(this);
						return string;
					}
					
				}
			};
			var  Buffer = function(data) {		
				var data = new Uint8Array(data);
				BufferPrototype.call(data);
				return data;
			};
			(function() {
				this.create = function(data) {
					if(typeof data === "string") {
						var data = utf8.ucs2decode(data);	
						var buffer = new Buffer(data.length);
						data.forEach(function(object, index) {
							buffer[index] = object;
						});
						return  buffer;
					}
				}
			}).call(Buffer);
			module.exports = Buffer;
		}else{
			module.exports = Buffer;
		}
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });	
(function(define) {'use strict'
  define("latte_lib/old/fs", ["require", "exports", "module", "window"],
  function(require, exports, module, window){
      var Fs = require("fs")
        , Path = require("path");
        /**
          @class fs
          @namespace latte_lib
          @module old
        */
      (function() {
        var self = this;
		for(var i in Fs) {
			self[i] = Fs[i]
		};
        this.exists = function(path, callback) {
          return Fs.exists(path, callback);
        }
        /**
        *  @method existsSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path 文件地址字符串
        *  @return {Bool}  exists   是否存在   存在为true；不存在为false
        *  @nodejs
          @example

            //@nodejs
            var Fs  = require("latte_lib");
            var exists = Fs.existsSync("./test.js");
            log(exists);
        */
        this.existsSync = function(path) {
          return Fs.existsSync(path);
        }
        /**
        *  @method mkdirSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path
        *  @param {Object} options
        *  @return {Error} error
        *  @nodejs
           @example
              //nodejs


        */
        this.mkdirSync = function(path, options) {
            if( self.existsSync(path)) {
              return null;
            }
            if(!self.existsSync(Path.dirname(path))) {
              var error = self.mkdirSync(Path.dirname(path), options);
              if(error) { return error; }
            }
            return Fs.mkdirSync(path, options);
        }
        /**
        *  @method writeFileSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path
        *  @param {String} data
        *  @return {Error} error
        *  @example
            //@nodejs

        */
        this.writeFileSync = function(path, data) {
          var error = self.mkdirSync(Path.dirname(path));
          if(error) { return error; }
          return Fs.writeFileSync(path, data, {encoding: "utf8"});
        }
        /**
          @method writeFile
          @static
          @public
          @sync
          @param {String} path
          @param {String} data
          @param {Function} callback
          @example
            //@nodejs
            var Fs = require("latte_lib").fs;
            Fs.writeFile("./test", test);
        */
        this.writeFile = function(path, data, callback) {
          self.mkdir(Path.dirname(path), null, function() {
  					Fs.writeFile(path, data, {encoding: "utf8"}, callback);
  				});
        }
        this.readFile = function(path, callback) {
          return Fs.readFile(path, function(err, buffer) {
              callback(err, buffer? buffer.toString(): null);
          });
        }
        this.readFileSync = function(path) {
          return Fs.readFileSync(path).toString();
        }
        this.mkdir = function(path, options, callback) {
          self.exists(path, function(exists) {
              if(exists) {
                callback(null, path);
              }else{
                self.mkdir(Path.dirname(path), options, function(err) {
                  if(err) { return callback(err); }
                  Fs.mkdir(path, options, callback);
                });
              }
          });
        }
        this.copyFile = function(fromPath, toPath, callback) {
          //@finding best function
          try {
            var from = Fs.createReadStream(fromPath);
            self.mkdir(Path.dirname(toPath), null, function(error) {
              var to = Fs.createWriteStream(toPath);
              from.pipe(to);
              callback(null);
            });
          }catch(e) {
            callback(e);
          }
        }

        this.copyDir = function(fromPath, toPath, callback) {

        }
        this.fileType = function(path) {
          return Path.extname(path).substring(1);
        }
        this.lstatSync = function(path) {
          return Fs.lstatSync(path);
        }
        this.readdirSync = function(path) {
          return Fs.readdirSync(path);
        }
        this.realpathSync = function(path, cache) {
          return Fs.realpathSync(path, cache);
        }
        this.appendFile = function(filename, data, options, callback) {
          return Fs.appendFile(filename, data, options, callback);
        }
        this.appendFileSync = function(filename, data, options) {
          return Fs.appendFile(filename, data, options);
        }
        /**
          @method deleteFileSync
          @static
          @sync
          @param {String} filename
          @param {Function} callback
          @example

            var Fs = require("latte_lib").fs;
            Fs.deleteFile("test", function(error) {
              console.log(error);
            });
        */
        this.deleteFile = function(filename, callback) {
          Fs.unlink(filename, callback);
        }
        /**
          @method deleteFileSync
          @static
          @sync
          @param {String} path
          @return {Error} error
          @example

            var Fs = require("latte_lib").fs;
            Fs.deleteFileSync("test");
        */
        this.deleteFileSync = function(path) {
            return Fs.unlinkSync(path);
        }
        this.stat = function(path, callback) {
            return Fs.stat(path, callback);
        }
        this.createReadStream = function(path, options) {
            return Fs.createReadStream(path, options);
        }
        this.createWriteStream = function(path, options) {
            return Fs.createWriteStream(path, options);
        }

        this.rename = function(oldPath, newPath, callback) {
            return Fs.rename(oldPath, namePath, callback);
        }
        this.watch = function(filename, options, listener) {
            return Fs.watch(filename, options, listener);
        }
        this.statSync = function(filename) {
            return Fs.statSync(filename);
        }
        this.WriteStream = Fs.WriteStream;
      }).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/promise", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {

		(function() {
			this.defer = function() {
				var pending = [], value;
				return {
			        resolve: function (_value) {
			            if (pending) {
			                value = ref(_value);
			                for (var i = 0, ii = pending.length; i < ii; i++) {
			                    // XXX
			                    enqueue(function () {
			                        value.then.apply(value, pending[i]);
			                    });
			                }
			                pending = undefined;
			            }
			        },
			        promise: {
			            then: function (_callback, _errback) {
			                var result = defer();
			                _callback = _callback || function (value) {
			                    return value;
			                };
			                _errback = _errback || function (reason) {
			                    return reject(reason);
			                };
			                var callback = function (value) {
			                    result.resolve(_callback(value));
			                };
			                var errback = function (reason) {
			                    result.resolve(_errback(reason));
			                };
			                if (pending) {
			                    pending.push([callback, errback]);
			                } else {
			                    // XXX
			                    enqueue(function () {
			                        value.then(callback, errback);
			                    });
			                }
			                return result.promise;
			            }
			        }
			    };
			}

			this.ref = function(value) {
				if(value && value.then) {
					return value;
				}
				return {
					then: function(callback) {
						var result = defer();
						enqueue(function() {
							result.resolve(callback(value));
						});
						return result.promise;
					}
				};
			}
			this.reject = function(reason) {
				return {
					then: function(callback, errback) {
						var result = defer();
						enqueue(function() {
							result.resolve(errback(reason));
						});
						return result.promise;
					}
				}
			};
			this.when = function(value, _callback, _errback) {
				var result = defer();
				var done;
				_callback = _callback || function(value) {
					return value;
				}
				_errback = _errback || function(reason) {
					return reject(reason);
				}
				var callback = function(value) {
					try {
						return _callback(value);
					}catch(reason) {
						return reject(reason);
					}
				};
				var errback = function(reason) {
					try {
						return _errback(reason);
					} catch(reason) {
						return reject(reason);
					}
				};
				enqueue(function() {
					ref(value).then(function(value) {
						if(done) 
							return;
						done = true;
						result.resolve(ref(value).then(callback, errback));
					}, function(reason) {
						if(done) {
							return;
						}
						done = true;
						result.resolve(errback(reason));
					});
				});
				return result.promise;
			}
		}).call(module.exports);	
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });	
(function(define) {'use strict'
	define("latte_lib/old/queue", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		/**
			@module old
			@namespace latte_lib
			@class queue
		*/

		function Queue(size) {
			this._size = Math.max(+size | 0, 1);
			this.slots = [];
			for(var i = 0; i < this._size; i++) {
				this.slots.push([]);
			}
		}
		(function(){
			/**
				@method size
				@return {Int} total
				@sync
				@example

					var Queue =  require("latte_lib").queue;
					console.log(Queue);
					var queue = new Queue();
					log(queue.size()); //0
			*/
			this.size = function() {
				if(this.total == null) {
					this.total = 0;
					for(var i = 0 ; i< this._size; i++) {
						this.total += this.slots[i].length;
					}
				}
				return this.total;
			}
			/**
				@method enqueue
				@param {Object} obj
				@param {Int} priority
				@example
					var Queue = require("latte_lib").queue;
					var q = new Queue(2);
					q.enqueue("1", 0);
					q.enqueue("2", 1);
					q.enqueue("3",0);
					log(q.size());//3
					log(q.dequeue());//1
					log(q.dequeue());//3
					log(q.dequeue());//2
			*/
			this.enqueue = function(obj, priority) {
				var priorityOrig;
				priority = priority && +priority | 0 || 0;
				this.total = null;
				if(priority) {
					priorityOrig = priority;
					if(priority < 0 || priority >= this._size) {
						priority = (this._size -1);
					}
				}
				this.slots[priority].push(obj);
			}
			/**
				@method dequeue
				@return {Object} obj
				@example
					var Queue = require("latte_lib").queue;
					var q = new Queue();
					var one = q.dequeue();
					log(one); //null
					q.enqueue("1");
					var two = q.dequeue();
					log(two); // 1

			*/
			this.dequeue = function() {
				var obj = null, sl = this.slots.length;
				this.total = null;
				for(var i = 0; i < sl; i++) {
					if(this.slots[i].length > 0) {
						obj = this.slots[i].shift();
						break;
					}
				}
				return obj;
			}
		}).call(Queue.prototype);
		module.exports = Queue;
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/reconnection", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var latte_lib = require("../lib");
		function Reconnection(config) {
			this.attempts = 0;
			this.reconnecting = config.reconnecting || false;//是否在重连
			this.openReconnect = true;//是否开启重启
			this.readyState = "close";
			this.reconnectionDelay = config.reconnectionDelay || 2000;
			this.reconnectionDelayMax = config.reconnectionDelayMax || 60*1000;
			
		};
		(function(){
			this.maybeReconnectOnOpen = function() {
				/*if(!this.openReconnect && !this.reconnecting && this._reconnection && this.attempts === 0) {
					this.openReconnect = true;
					this.reconnect();
				}*/
				if(!this.reconnecting && this.readyState.indexOf("close") != -1 && this.openReconnect) {
					this.reconnect();
				}
			}

			this.cleanup = function() {}
			this.onReconnect = function() {
				var attempt = this.attempts;
				this.attempts = 0;
				this.reconnecting = false;
			}
			this.reconnect = function () {
				if(this.reconnecting) return this;
				if(!this.openReconnect) return this;
				var self = this;
				if(this.attemptsMax && ++this.attempts > this.attemptsMax) {
					this.reconnecting = false;
					console.log("reconnecting_fail full");
				} else {
					var delay = this.attempts * this.reconnectionDelay;
					delay = Math.min(delay, this.reconnectionDelayMax);
					this.reconnecting = true;
					var timer = setTimeout(function() {
						self.open(function(err) {
							if(err) {
								self.reconnecting = false;
								self.reconnect();
							}else {
								self.onReconnect();
							}
						});
					}, delay);
				}
			}
			this.onClose = function(reason) {
				this.cleanup();
				this.readyState = "closed";
				//this.emit("close", reason);
				if(this.openReconnect) {
					this.reconnect();
				}
			}
		}).call(Reconnection.prototype);
		module.exports = Reconnection;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/old/removeIdle", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		/**
			@module old
			@namespace latte_lib
			@class removeIdle
		*/
		function RemoveIdle(config) {
			this.reapIntervalMillis = config.reapIntervalMillis || 1000;
			this.idleTimeoutMillis = config.idleTimeoutMillis || 10000;
			this.refreshIdle = config.refreshIdle || true;
			this.returnToHead = config.returnToHead || false;
			this.scheduleRemoveIdle();
			this.min = config.min || 0;
			this.max = config.max || 1000;
			this.availableObjects = [];
			this._destroy = config.destroy || function() {};
			this._create = config.create;
			this.log = config.log || null;
		};
		(function() {
			/**
				forget the function 
			*/
			this.removeConditions = function() {	return true;}
			/**
				when clean a object after then do the function
				@interface

			*/
			this.ensureMinimum = function() {

			}
			/**
				when add a object after then do the function
				@interface

			*/
			this.dispense = function() {}
			/**
					@method getIdle
					@param {Object} obj
					@example
						var RemoveIdle = require("latte_lib").removeIdle;
						var r = new RemoveIdle({
									idleTimeoutMillis: 1000
						});
						var obj = "1";
						r.release(obj);
						log(r.size());//1
						r.getIdle(obj);
						log(r.size());//0


			*/
			this.getIdle = function(obj) {
				this.availableObjects = this.availableObjects.filter(function(objWithTimeout) {
					return (objWithTimeout.obj !== obj);
				});
			}
			/**
				@method size
				@return {Int}
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					log(r.size());//0
			*/
			this.size = function() {
				return this.availableObjects.length;
			}
			/**
				@method update
				@param {Object} obj
				@example

					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					var obj = {
							timeout: Date.now()-1,
							obj: "1"
					};
					setTimeout(function(){

							r.availableObjects.push(obj);
							setTimeout(function() {
									log("one", r.size());//one,1
									r.update(obj.obj);
									r.removeIdle();
									log("two",r.size());//two,1
									setTimeout(function(){
												log("three", r.availableObjects.length);//three,0
									},1000);
							}, 2000);
					}, 2000);

			*/
			this.update = function(obj) {
				for(var i =0 , len = this.availableObjects.length; (i < len && this.removeConditions());i++) {
    				if(obj == this.availableObjects[i].obj) {
    					this.availableObjects[i].timeout = new Date().getTime() + this.idleTimeoutMillis;
    				}
    			}
			}
			/**
				add obj in availableObjects
				@method release
				@param {Object} obj
				@public
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
						idleTimeoutMillis: 1000
					});
					r.release("1");
					log(r.size());//1
					setTimeout(function(){
						log(r.size());//0
					}, 1000);
			*/
			this.release = function(obj) {
				if(this.availableObjects.some(function(objWithTimeout) {
					if(objWithTimeout.obj === obj) {
						//续时
						objWithTimeout.timeout =  new Date().getTime() + this.idleTimeoutMillis;
						return true;
					}
				})) {
					this.log && this.log.error("called twice for the same resource")
					//刷新
					return;
				};
				var objWithTimeout = {obj: obj, timeout: (new Date().getTime() + this.idleTimeoutMillis)}
				if(this.returnToHead) {
					this.availableObjects.splice(0,0,objWithTimeout);
				} else{
					this.availableObjects.push(objWithTimeout);
				}
				this.dispense();
				this.scheduleRemoveIdle();
			}
			/**
				@method removeIdle
				@example

					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					//sleep 2000ms
					//when r.availableObjects.length == 0  then close autoClean;
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.removeIdle();
									log("two",r.size());//two,0
							}, 2000);
					}, 2000);

			*/
			this.removeIdle = function() {
				var toRemove = [],
    				now = new Date().getTime(),
    				self = this
    				timeout;
				this.removeIdleScheduled = false;
    			for(var i =0 , len = this.availableObjects.length; (i < len && this.removeConditions());i++) {
    				var timeout = this.availableObjects[i].timeout;
    				if(now > timeout) {
    					toRemove.push(this.availableObjects[i].obj);
    				}
    			}
    			for(var i = 0, len = toRemove.length; i < len; i++) {
    				self.destroy(toRemove[i]);
    			}
    			if(this.availableObjects.length > 0) {
    				this.scheduleRemoveIdle();
    			}
			}
			/**
				@method scheduledRemoveIdle
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.scheduleRemoveIdle();
									log("two",r.size());//two,1
									setTimeout(function(){
												log("three", r.size());//three,0
									},1000);
							}, 2000);
					}, 2000);
			*/
			this.scheduleRemoveIdle = function() {
				if (!this.removeIdleScheduled) {
					this.removeIdleScheduled = true;
					this.removeIdleTimer = setTimeout(this.removeIdle.bind(this), this.reapIntervalMillis);
		    }
			}
			/**
				@method destroy
				@param {Object} obj
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.destroy(r.availableObjects[0].obj);
									log("two",r.size());//two,1
							}, 2000);
					}, 2000);
			*/
			this.destroy = function(obj) {
				this.getIdle(obj);
				this._destroy(obj);
				this.ensureMinimum();
			}
			/**
				@method destroyAllNow
				@param {Function} callback
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});

					r.availableObjects.push({
							timeout: Date.now()+ 60 * 60 * 1000,
							obj: "1"
					});
					setTimeout(function() {
							log("one", r.size());//one,1
							r.destroyAllNow();
							log("two",r.size());//two,0
					}, 2000);

			*/
			this.destroyAllNow = function(callback) {
				var willDie = this.availableObjects;
				this.availableObjects = [];
				var obj = willDie.shift();
				var self = this;
				while(obj !== null && obj !== undefined) {
					self.destroy(obj.obj);
					obj = willDie.shift();
				}
				this.removeIdleScheduled = false;
				clearTimeout(this.removeIdleTimer);
				if(callback) {
					callback();
				}
			}
		}).call(RemoveIdle.prototype);
		module.exports = RemoveIdle;
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { //'use strict';
	define("latte_lib/old/xhr", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
      var lib = require("../lib")
          , events = require("../events")
          , empty = function() {}
          , Request
          , XMLHttpRequest;
      var defaultHeaders = {

      };
      if(window) {
          XMLHttpRequest = window.XMLHttpRequest;
          Request = function(opts) {
              this.method = opts.method || "GET";
              this.uri = opts.uri;
              this.data = opts.data;
              this.async = false != opts.async;

              this.xd = !!opts.xd;
              this.xs = !!opts.xs;
              this.agent = opts.agent;
              this.enablesXDR = opts.enablesXDR;

              this.pfx = opts.pfx;
              this.key = opts.key;
              this.passphrase = opts.passphrase;
              this.cert = opts.cert;
              this.ca = opts.ca;
              this.ciphers = opts.ciphers;
              this.rejectUnauthorized = opts.rejectUnauthorized;

              this.headers = lib.merger(defaultHeaders, opts.headers);
              this.create();
          }
          lib.inherits(Request, events);
          (function() {
              this.create = function() {
                  var xhr = this.xhr = new XMLHttpRequest({
                      agent: this.agent,
                      xdomain: this.xd,
                      xscheme: this.xs,
                      enablesXDR: this.enablesXDR,
                      pfx: this.pfx,
                      key: this.key,
                      passphrase: this.passphrase,
                      cert: this.cert,
                      ca: this.ca,
                      ciphers: this.ciphers,
                      rejectUnauthorized: this.rejectUnauthorized
                  });
                  var self = this;
                  try {
                     xhr.open(this.method, this.uri, this.async);
                     if("withCredentials" in xhr) {
                        xhr.withCredentials = true;
                     }
                     try {
                          if(this.headers) {
                              //xhr.setDisableHeaderCheck(true);
                              for(var i in this.headers) {
                                  if(this.headers.hasOwnProperty(i)) {
                                      xhr.setRequestHeader(i, this.headers[i]);
                                  }
                              }
                          }
                     }catch(e) {
                        console.log("setHeader error", e);
                     }
                     if(this.hasXDR()) {
                        xhr.onload = function() {
                            self.onLoad();
                        }
                        xhr.onerror = function() {
                            self.onError(xhr.responseText);
                        }
                     } else {
                        xhr.onreadystatechange = function() {
                            if(4 != xhr.readyState) return;
                            if(200 == xhr.status || 1223 == xhr.status) {
                                self.onLoad();
                            }else{
                                lib.nextTick(function(){
                                    self.onError(xhr.status);
                                });
                            }
                        }
                     }
                     xhr.send(this.data);
                  } catch(e) {
                      return lib.nextTick(function() {
                            self.onError(e);
                      });
                  }
                  if(Request.requests) {
                      this.index = Request.requests.requestsCount++;
                      Request.requests[this.index] = this;
                  }
              }

              this.onSuccess = function() {
                  this.emit("success");
                  this.cleanup();
              };

              this.onData = function(data) {
                  this.emit("data", data);
                  this.onSuccess();
              };

              this.onError = function(err) {
                  this.emit("error", err);
                  this.cleanup(true);
              }

              this.cleanup = function(fromError) {
                  if("undefined" == typeof this.xhr || null == this.xhr) {
                      return;
                  }
                  if(this.hasXDR()) {
                      this.xhr.onload = this.xhr.onerror = empty;
                  }else{
                      this.xhr.onreadystatechange = empty;
                  }
                  if(fromError) {
                      try {
                          this.xhr.abort();
                      }catch(e) {

                      }
                  }

                  if(Request.requests) {
                      delete Request.requests[this.index];
                  }
                  this.xhr = null;
              }

              this.onLoad = function() {
                  var data;
                  try {
                      var contentType;
                      try {
                          contentType = this.xhr.getResponseHeader("Content-Type");
                      }catch(e) {}
                      if(contentType == "application/octet-stream") {
                          data = this.xhr.response;
                      }else{
                          if(!this.supportsBinary) {
                              data = this.xhr.responseText;
                          } else {
                              var Buffer = require("./buffer");
                              data = String.fromCharCode.apply(null, new Buffer(this.xhr.response));
                          }
                      }
                  } catch(e) {
                      this.onError(e);
                  }
                  if( null != data) {
                      this.onData(data);
                  }
              }

              this.hasXDR = function() {
                  return (!window || "undefined" !== typeof window.XDomainRequest) && !this.xs && this.enablesXDR;
              }

              this.abort = function() {
                  this.cleanup();
              }
              if(window.attachEvent) {
                window.attachEvent("onunload", Request.unloadHandler);
              }else{
								window.addEventListener("beforeunload", Request.unloadHandler, false);
							}

          }).call(Request.prototype);
      }else{
        var URL = require("url");
        var Request = function(opts) {
            this.uri = opts.uri;
            this.method = opts.method || "GET";
            this.data = opts.data;
            this.encoding = opts.encoding || "utf8";
            this.headers = lib.merger(defaultHeaders, opts.headers);
            this.create();
        };
        lib.inherits(Request, events);
        (function() {
            this.create = function() {
                var self = this;
                var opts = URL.parse(this.uri);
                opts.method = this.method;
                var handleName = opts.protocol.substring(0,  opts.protocol.length -1);
                var handle = require(handleName);
								var Domain = require("domain");
								var domain = Domain.create();
								domain.on("error", function(err) {
										self.onError(err);
								});
								domain.run(function() {
									var req = this.req = handle.request(opts, function(res) {
											if(res.statusCode != 200) {
													return self.onError(res.statusCode);
											}
											self.emit("headers", res.headers);
											res.setEncoding(self.encoding);
											var data = "";
											res.on("data", function(chunk) {
													self.emit("chunk", chunk);
													data += chunk.toString();
											});
											res.on("end", function() {
													self.onData(data, res.headers);
											});
									});
									req.on("error", function(error) {
											self.onError(error);
									});
									req.end(this.data);
									if(Request.requests) {
											this.index = Request.requests.requestsCount++;
											Request.requests[this.index]  = this;
									}
								});

            }
            this.onError = function(error) {
                this.emit("error", error);
                this.cleanup(true);
            }
            this.onData = function(data, type) {
                this.emit("data", data, type);
                this.cleanup(false);
            }
            this.cleanup = function(fromError) {
                if("undefined" == typeof this.req || null == this.req) {
                    return;
                }
                this.onData = this.onError = empty;
                if(fromError) {
                    try {
                        this.req.abort();
                    }catch(e){}
                }
                if(Request.requests) {
                    delete Request.requests[this.index];
                }
                this.req = null;
            }
        }).call(Request.prototype);

      }
      (function() {
          this.requests = {};
          this.requestsCount = 0;
          var _self = this;
          this.unloadHandler = function() {
              for(var i in _self.requests) {
                  if(_self.requests.hasOwnProperty(i)) {
                      _self.requests[i].abort();
                  }
              }
          }
              var escape = function(str) {
                  return encodeURIComponent(str);
              }
              var stringifyPrimitive = function(v) {
									console.log(v);
                  switch(typeof v) {
                      case "string":
                      return v;
                      case "boolean":
                      return v? "true": "false";
                      case "number":
                      return isFinite(v)? v: "";
                      case "object":
                      return JSON.stringify(v);
                      default:
                      return "";
                  }
              }
              var urlencode = this.urlencode = function(obj, sep, eq) {
								sep = sep || "&";
								eq = eq || "=";
								if(obj === null) {
									obj = undefined;
								}
								if(typeof obj === "object") {
									return Object.keys(obj).map(function(k) {
										var ks = escape(stringifyPrimitive(k)) + eq;
										if(Array.isArray(obj[k])) {
											return ks + escape(JSON.stringify(obj[k]));
										} else {
											return ks + escape(stringifyPrimitive(obj[k]));
										}
									}).join(sep);
								}
              }
              var urldecode = this.urldecode = function(qs) {
                  var qry = {};
                  var pairs = qs.split("&");
                  for(var i = 0, l = pairs.length; i < l; i++) {
                      var pair = pairs[i].split("=");
                      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                  }
                  return qry;
              }

              this.get = function(uri, data, opts, onData, onError) {
                  if(lib.isFunction(opts)) {
                      onError = onData;
                      onData = opts;
                      opts = {};
                  }
                  opts.method = "GET";
                  opts.uri = uri + "?" + urlencode(data);
                  var req = new Request(opts);
                  onData && req.on("data", onData);
                  onError && req.on("error", onError);
                  return req;
              }
                  var getType = function(headers) {
                      if(!headers["Content-type"]) {
                          return "text";
                      }
                      if(headers["Content-type"].match(/octet-stream/i)) {
                          return "octet-stream";
                      }
											if(headers["Content-type"].match(/urlencoded/i)) {
													return "urlencoded";
											}
                      if(headers["Content-type"].match(/json/i)) {
                          return "json";
                      }
                      if(headers["Content-type"].match(/text/i)) {
                          return "text";
                      }
                  }
              var getData = function(data, headers) {
                  switch(getType(headers)) {
                      case "urlencoded":
                          return urlencode(data);
                      break;
                      case "json":
                          return JSON.stringify(data);
                      break;
                      case "octet-stream":
                          if(lib.isString(data)) {
                              return data;
                          }
                          var keys = Object.keys(data);
                          headers["x-file-name"] = keys[0];
                          return data[keys[0]];
                      break;
                      default:
                          return data.toString();
                      break;
                  }
              }
          this.post = function(uri, data, opts, onData, onError) {
              if(lib.isFunction(opts)) {
                  onError = onData;
                  onData = opts;
                  opts = {};
              }
              opts.method = "POST";
              opts.headers = opts.headers || {};
              opts.uri = uri;
              opts.data = getData(data, opts.headers);
              opts.headers["Content-length"] = opts.data.length;
              var req = new Request(opts);
              onData && req.on("data", onData);
              onError && req.on("error", onError);
              return req;
          }
          this.XMLHttpRequest = true;
      }).call(Request);

      module.exports = Request;
  });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

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

(function(define) {'use strict'
	define("latte_renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			var latte_lib = require("latte_lib");
 			var HashMap = require("./utils/hashMap")
 			var latte2ds = new HashMap();
 			var utils = require("./utils/lib");
 			var Renderer = require('./renderer')
 			, LatteObject = require("./object");	
 			var Latte2D = function(element, type) {
 				var self = this;
 				this.type = type || Latte2D.defaultType;
	 			this.renderer = Renderer.create(element, this.type);
	 			this.root = LatteObject.create("root",{
	 				x: 0, y:0, width: this.renderer.width, height: this.renderer.height
	 			},{
	 				backgroundColor: "#000000"
	 			});
	 			var mouse = {
	 				x:0, y: 0
	 			};
	 			element.addEventListener("mousedown", function(event) {
	 				
	 			}, false);
	 			element.addEventListener("mouseup", function(event) {

	 			},false);
	 			element.addEventListener("click", function(event) {
	 				self.root.isDown({x: mouse.x, y: mouse.y},0);
	 			}, false);
	 			element.addEventListener("dblclick", function(event) {

	 			}, false);
	 			element.addEventListener("mousewheel", function(event) {

	 			}, false);
	 			element.addEventListener("mousemove", function(event) {
	 				var x, y;
	 				if(event.pageX || event.pageY) {
	 					x = event.pageX;
	 					y = event.pageY;
	 				}else{
	 					x = event.clientX + document.body.scrollLeft + 
	 						document.documentElement.scrollLeft;
	 					y = event.clientY + document.body.scrollTop + 
	 						document.documentElement.scrollTop;
	 				}
	 				x -= element.offsetLeft;
	 				y -= element.offsetTop;
	 				mouse.x = x;
	 				mouse.y = y; 
	 			}, false);
	 			element.addEventListener("mouseover", function(event) {

	 			}, false);
	 			element.addEventListener("mouseout", function(event) {

	 			}, false);
	 			var touch = {x: null, y: null, isPressed: false};
	 			element.addEventListener("touchstart", function(event) {
	 				touch.isPressed = true;
	 			}, false);
	 			element.addEventListener("touchend", function(event) {
	 				touch.isPressed = false;
	 				touch.x = null;
	 				touch.y = null;
	 			}, false);	
	 			element.addEventListener("touchmove", function(event) {
	 				var x , y;
	 				touch_event = event.touches[0];
	 				if(touch_event.pageX || touch_event.pageY) {
	 					x = touch_event.pageX;
	 					y = touch_event.pageY;
	 				}else{
	 					x = touch_event.clientX + document.body.scrollLeft + 
	 						document.documentElement.scrollLeft;
	 					y = touch_event.clientY + document.body.scrollTop +
	 						document.documentElement.scrollTop;
	 				}
	 				x -= offsetLeft;
	 				y -= offsetTop;
	 				touch.x  = x;
	 				touch.y = y;
	 			}, false);

 			};
 			latte_lib.inherits(Latte2D, latte_lib.events);
 			(function() {
 				this.setRoot = function(func) {
 					func.call(this.root);
 				}
 				this.run = function() {
 					var result = [];
	 				this.root.update(0, result);
	 				this.renderer.draw(result);	
	 			}
	 			this.add = function(path, object) {
	 				this.root.add(path, object);
	 			}
	 			this.query = function(path) {
	 				return this.root.query(path);
	 			}
	 			this.start = function() {
	 				var self = this;
	 				var frame = function() {
	 					self.run();
	 					requestAnimationFrame(frame);
	 				};
	 				requestAnimationFrame(frame);
	 				
	 			}
	 			this.startOne = function() {
	 				this.run();
	 			}
	 			
 			}).call(Latte2D.prototype);
 			(function() {
 				this.types = {
 					"2d": {

 					},
 					"3d": {

 					}
 				}
 				this.defaultType = (function() {
 					return "2d";
 				})();
 			}).call(Latte2D);

 			this.get = function(element) {
 				
 				if(latte_lib.isString(element)) {
 					element = document.getElementById(element);
 					if(!element) {
 						var canvas = document.createElement("canvas");
 						canvas.id = element;
 						element = canvas;
 					}
 				}
 				if(!utils.isDom(element,"canvas")) {
 					throw new Error("element type is not canvas  ");
 				}
 				var latte2d = latte2ds.get(element);
 				if(!renderer) {
 					latte2d = new Latte2D(element);
 					latte2ds.push(element, latte2d);
 				}
 				return latte2d;
 			}
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });


(function(define) {'use strict'
	define("latte_renderer/loaders/textureLoader", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Cache = function() {};
 		(function() {
 			var self = this;
 			this.enabled = false;
 			this.files = {};
 			this.add = function(key, file) {
 				if(self.enabled === false) return ;
 				this.files[key] = file;
 			}
 			this.get = function(key) {
 				if(self.enabled === false) return ;
 				return this.files[key];
 			}

 			this.remove = function(key) {
 				delete self.files[key];
 			}
 			this.clear = function() {
 				self.files = {};
 			}
 		}).call(Cache);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

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

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2AABB", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 			/**
   			@module 类
   			@namespace collision
   			@class AABB
   		*/
   		/**
   			上界
   			@property upperBound
   			@type {common.math.Vec2}
   		*/
   		/**
   			下界
			@property lowerBound
			@type {common.math.Vec2}
   		*/
   		var Vec2 = require("../common/math/b2Vec2");
   		var AABB = function() {
   			this.lowerBound = new Vec2();
      		this.upperBound = new Vec2();
   		};
   		(function() {
   			/**
   				求中心点
   				@method getCenter
   				@return {common.Vec2}
   			*/
   			this.getCenter = function() {
   				return new Vec2((this.lowerBound.x + this.upperBound.x)/2 ,(this.lowerBound.y + this.upperBound.y)/2);
   			}
   			/**
   				结合
   				@method combine
   				@param aabb1 {collision.AABB}
   				@param aabb2 {collision.AABB}
   			*/
   			this.combine = function(aabb1, aabb2) {
   				this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
   				this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
   				this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
   				this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y);
   			}
   			/**
   				判断是否包含
   				@method contains
   				@param aabb {collision.AABB}
   			*/
   			this.contains = function(aabb) {
   				return 
	   				this.lowerBound.x <= aabb.lowerBound.x &&
	   				this.lowerBound.y <= aabb.lowerBound.y &&
	   				aabb.upperBound.x <= this.upperBound.x &&
	   				aabb.upperBound.y <= this.upperBound.y;
   			}
            /**
               是否重叠
               @method testOverlap
               @param other {collision.AABB}
            */
            this.testOverlap = function(other) {
               var d1X = other.lowerBound.x - this.upperBound.x;
               var d1Y = other.lowerBound.y - this.upperBound.y;
               var d2X = this.lowerBound.x - other.upperBound.x;
               var d2Y = this.lowerBound.y - other.upperBound.y;
               if (d1X > 0.0 || d1Y > 0.0) return false;
               if (d2X > 0.0 || d2Y > 0.0) return false;
               return true;
            }
   		}).call(AABB.prototype);
		(function(){
			this.combine = function(aabb1, aabb2){
            var aabb = new AABB();
            aabb.combine(aabb1, aabb2);
            return aabb;
         }
		}).call(AABB);
		module.exports = AABB;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Bound", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Bound = function() {

 		};
 		(function() {

 		}).call(b2Bound.prototype);
 		module.exports = b2Bound;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2BoundValues", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2BoundValues = function() {

 		};
 		(function() {

 		}).call(b2BoundValues.prototype);
 		module.exports = b2BoundValues;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Collision", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Collision = function() {

 		};
 		(function() {

 		}).call(b2Collision.prototype);
 		module.exports = b2Collision;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2ContactID", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Features = require("./b2Features")
   		var ContactId = function() {
   			this.features = new Features();
            this.init();
         };
         (function() {
            this.init = function() {
            	this.features._m_id = this;
            }
         }).call(ContactId.prototype);
         module.exports = ContactId;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2ContactPoint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactPoint = function() {

 		};
 		(function() {

 		}).call(b2ContactPoint.prototype);
 		module.exports = b2ContactPoint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Distance", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Distance = function() {

 		};
 		(function() {

 		}).call(b2Distance.prototype);
 		module.exports = b2Distance;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DistanceInput", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2DistanceInput = function() {

 		};
 		(function() {

 		}).call(b2DistanceInput.prototype);
 		module.exports = b2DistanceInput;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTree", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Settings = require("../common/b2Settings")
            , DynamicTreeNode = require("./b2DynamicTreeNode")
            , AABB = require("./b2AABB");
            /**
               空闲的节点
               @property m_freeList
               @type {[]collision.DynamicTreeNode}
            */
            /**
               根节点
               @property m_root
               @type {collision.DynamicTreeNode}
            */
            /**
               插入节点个数
               @property m_insertionCount
               @type {Int}
            */
   		var DynamicTree = function() {
            this.init();
         };
         (function() {
            this.init = function() {
               this.m_root = null;
               this.m_freeList = null;
               this.m_path = 0;
               this.m_insertionCount = 0;
            }
            this.createProxy = function(aabb, userData) {
               var node = this.allocateNode();
               var extendX = Settings.aabbExtension;
               var extendY = Settings.aabbExtension;
               node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
               node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
               node.aabb.upperBound.x = aabb.upperBound.x + extendX;
               node.aabb.upperBound.y = aabb.upperBound.y + extendY;
               node.userData = userData;
               this.insertLeaf(node);
               return node;
            }

            /**
               分配节点
               @allocateNode
               @return node {collision.DynamicTreeNode}
            */
            this.allocateNode = function() {
               if(this.m_freeList) {
                  var node = this.m_freeList;
                  this.m_freeList = node.parent;
                  node.parent = null;
                  node.child1 = null;
                  node.child2 = null;
                  return node;
               }
               return new DynamicTreeNode();
            }
            /**
               插入树叶
               @method insertLeaf
               @param node {collision.DynamicTreeNode}
            */
            this.insertLeaf = function(leaf) {
               //插入树叶个数增加
               ++this.m_insertionCount;
               if(this.m_root == null) {
                  //没有根节点的话  就成为根节点
                  this.m_root = leaf;
                  this.m_root.parent = null;
                  return;
               }
               var center = leaf.aabb.getCenter();
               var sibling = this.m_root;
               if(sibling.isLeaf() == false) {
                  do {
                     var child1 = sibling.child1;
                     var child2 = sibling.child2;
                     var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
                     var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
                     if(norm1 < norm2) {
                        sibling = child1;
                     }else{
                        sibling = child2;
                     }
                  }while (sibling.isLeaf() == false);
               }
            
               var node1 = sibling.parent;
               var node2 = this.allocateNode();
               node2.parent = node1;
               node2.userData = null;
               node2.aabb.combine(leaf.aabb, sibling.aabb);
               if(node1) {
                  if(sibling.parent.child1 == sibling) {
                     node1.child1 = node2;
                  }else{
                     node1.child2 = node2;
                  }
                  node2.child1 = sibling;
                  node2.child2 = leaf;
                  sibling.parent = node2;
                  leaf.parent = node2;
                  do {
                     if(node1.aabb.contains(node2.aabb)) { break;}
                        node1.aabb.combine(node1.child1.aabb, node1.child2.aabb);
                        node2 = node1;
                        node1 = node1.parent;
                  } while(node1) 
               }else{
                  node2.child1 = sibling;
                  node2.child2 = leaf;
                  sibling.parent = node2;
                  leaf.parent = node2;
                  this.m_root = node2;
               }
            }

            this.getFatAABB = function(proxy) {
               return proxy.aabb;
            }

            this.query = function(callback, aabb) {
               if(this.m_root == null) return;
               var stack = new Array();
               var count = 0;
               stack[count++] = this.m_root;
               while(count > 0) {
                  var node = stack[--count];
                  if(node.aabb.testOverlap(aabb)) {
                     if(node.isLeaf()) {
                        var proceed = callback(node);
                        if(!proceed) return;
                     }else{
                        stack[count++] = node.child1;
                        stack[count++] = node.child2;
                     }
                  
                  }
               }
            }

            this.getUserData = function(proxy) {
               return proxy.userData;
            }
            /**
               dynamicTreeBroadPhase.moveProxy
            */
            this.moveProxy = function(proxy, aabb, displacement) {
               Settings.assert(proxy.isLeaf());
               if (proxy.aabb.contains(aabb)) {
                  return false;
               }
               this.removeLeaf(proxy);
               var extendX = Settings.aabbExtension + Settings.aabbMultiplier * (displacement.x > 0 ? displacement.x : (-displacement.x));
               var extendY = Settings.aabbExtension + Settings.aabbMultiplier * (displacement.y > 0 ? displacement.y : (-displacement.y));
               proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
               proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
               proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
               proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
               this.insertLeaf(proxy);
               return true;
            }
            /**   
               删除叶子
               @method removeLeaf
            */
            this.removeLeaf = function(leaf) {
               if (leaf == this.m_root) {
                  this.m_root = null;
                  return;
               }
               var node2 = leaf.parent;
               var node1 = node2.parent;
               var sibling;
               if (node2.child1 == leaf) {
                  sibling = node2.child2;
               }
               else {
                  sibling = node2.child1;
               }
               if (node1) {
                  if (node1.child1 == node2) {
                     node1.child1 = sibling;
                  }
                  else {
                     node1.child2 = sibling;
                  }
                  sibling.parent = node1;
                  this.freeNode(node2);
                  while (node1) {
                     var oldAABB = node1.aabb;
                     node1.aabb = AABB.combine(node1.child1.aabb, node1.child2.aabb);
                     if (oldAABB.contains(node1.aabb)) break;
                     node1 = node1.parent;
                  }
               }
               else {
                  this.m_root = sibling;
                  sibling.parent = null;
                  this.freeNode(node2);
               }
            }

            this.freeNode = function(node) {
               node.parent = this.m_freeList;
               this.m_freeList = node;
            }
         }).call(DynamicTree.prototype);
         module.exports = DynamicTree;
   
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTreeBroadPhase", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		 var DynamicTree = require("./b2DynamicTree")
            , DynamicTreePair = require("./b2DynamicTreePair");
         /**
            @module 类
            @namespace collision
            @class DynamicTreeBroadPhase
         */

         /**
            @property m_tree
            @type {collision.dynamicTree}
         */
         /**
            @property m_moveBuffer
            @type {Array}
         */
         /**
            @property m_pairBuffer
            @type {Array}
         */
         /**
            @property m_pairCount
            @type {Int}
         */
   		var DynamicTreeBroadPhase = function() {
   			this.m_tree = new DynamicTree();
   			this.m_moveBuffer = new Array();
   			this.m_pairBuffer = new Array();
   			this.m_pairCount = 0;
   		};
   		(function() {
            this.createProxy = function(aabb, userData) {
               var proxy = this.m_tree.createProxy(aabb, userData);
               ++this.m_proxyCount;
               this.bufferMove(proxy);
               return proxy;
            }
            this.bufferMove = function(proxy) {
               this.m_moveBuffer[this.m_moveBuffer.length] = proxy;
            }
            var latteWait = 0;
            this.updatePairs = function(callback) {
               var self = this;
               self.m_pairCount = 0;
               var i = 0
                  , queryProxy;
               
               for(i = 0; i < self.m_moveBuffer.length; ++i) {
                  queryProxy = self.m_moveBuffer[i];               
                  function QueryCallback(proxy) {
                     if(proxy == queryProxy) return true;
                     if(self.m_pairCount == self.m_pairBuffer.length) {
                        self.m_pairBuffer[self.m_pairCount] = new DynamicTreePair();
                     }
                     var pair = self.m_pairBuffer[self.m_pairCount];
                     pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
                     pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
                     ++self.m_pairCount;
                     return true;
                  };
                  var fatAABB = self.m_tree.getFatAABB(queryProxy);
                  self.m_tree.query(QueryCallback, fatAABB);
               }
               /**
               if(latteWait++) {
                  console.log(self.m_tree);
                  throw "test";
               }
                */
               self.m_moveBuffer.length = 0;
               for(var i = 0 ; i < self.m_pairCount;) {
                  var primaryPair = self.m_pairBuffer[i];
                  var userDataA = self.m_tree.getUserData(primaryPair.proxyA);
                  var userDataB = self.m_tree.getUserData(primaryPair.proxyB);
                  callback(userDataA, userDataB);
                  ++i;
                  while(i < self.m_pairCount) {
                     var pair = self.m_pairBuffer[i];
                     if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
                        break;
                     }
                     ++i;
                  }
               }
            }
            /**
               fixture.synchronize->

            */
            this.moveProxy = function(proxy, aabb, displacement){
               
               var buffer = this.m_tree.moveProxy(proxy, aabb, displacement);
               if (buffer) {
                  this.bufferMove(proxy);
               }
            }

            this.testOverlap = function(proxyA, proxyB) {
               var aabbA = this.m_tree.getFatAABB(proxyA);
               var aabbB = this.m_tree.getFatAABB(proxyB);
               return aabbA.testOverlap(aabbB);
            }  
   		}).call(DynamicTreeBroadPhase.prototype);
   		module.exports = DynamicTreeBroadPhase;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTreeNode", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var AABB = require("./b2AABB");
   		var DynamicTreeNode = function() {
   			this.aabb = new AABB();
   		};
   		(function() {
   			/**
   				判断是否树叶
   				@method isLeaf
   				@return {Boolean}
   			*/
   			this.isLeaf = function() {
   				return this.child1 == null;
   			}
   		}).call(DynamicTreeNode.prototype);
   		module.exports = DynamicTreeNode;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2DynamicTreePair", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var AABB = require("./b2AABB");
   		var DynamicTreePair = function() {
   			
   		};
   		(function() {
   			
   		}).call(DynamicTreePair.prototype);
   		module.exports = DynamicTreePair;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/b2Features", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Features = function() {

   		};
   		(function() {

   		}).call(Features.prototype);
   		module.exports = Features;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2Manifold", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Settings = require("../common/b2Settings")
   			, ManifoldPoint = require("./b2ManifoldPoint");
   		var Manifold = function() {
   			this.m_pointCount = 0;
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_points = new Array(Settings.maxManifoldPoints);
   				for(var i = 0; i < Settings.maxManifoldPoints; i++) {
   					this.m_points[i] = new ManifoldPoint();
   				}
   				this.m_localPlaneNormal = new Vec2();
   				this.m_localPoint = new Vec2();
   			}
   		}).call(Manifold.prototype);
   		module.exports = Manifold;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/b2ManifoldPoint", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		 var ContactId = require("./b2ContactID");
   		var ManifoldPoint = function() {
            this.m_localPoint = new Vec2();
            this.m_id = new ContactId();
   		};
   		(function() {
   			
   		}).call(ManifoldPoint.prototype);
   		module.exports = ManifoldPoint;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/shapes/b2CircleShape", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Shape = require("./b2Shape")
   			, Vec2 = require("../../common/math/b2Vec2")
            , Settings = require("../../common/b2Settings")
   			, latte_lib = require("latte_lib");
   		/**
   			圆形
   			@module 类
   			@namespace collision.circleShape
   			@class CircleShape
			@param radius {Number} 半径
   		*/
   		var CircleShape = function(radius) {
   			Shape.apply(this, arguments);
   			this.m_p = new Vec2();
   			this.init(radius);
   		};
   		latte_lib.inherits(CircleShape, Shape);
   		(function() {
   			this.init = function(radius) {
   				if(radius === undefined) radius = 0;
   				Shape.call(this);
   				this.m_type = Shape.e_circleShape;
   				this.m_radius = radius;
   			}
   			this.copy = function() {
   				var s = new CircleShape();
   				s.set(this);
   				return s;
   			}
   			this.set = function(other) {
   				Shape.prototype.set.call(this, other);
   				if(other instanceof CircleShape) {
   					this.m_p.setV(other.m_p);
   				}
   			}
   			/**
   				@method computeAABB
   				@param aabb {collision.computeAABB}
   				@param transform {collision.Transform}
   			*/
   			this.computeAABB = function(aabb, transform) {
   				var tMat = transform.R;
   				var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
   				var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
   				aabb.lowerBound.set(pX - this.m_radius, pY - this.m_radius);
   				aabb.upperBound.set(pX + this.m_radius, pY + this.m_radius);
   			}
            /**
               @method computeMass
               @param massData {collision.shapes.massData}
               @param density {Int}
            */
            this.computeMass = function(massData, density) {
               if(density === undefined) density = 0;
               massData.mass = density * Settings.pi * this.m_radius * this.m_radius;
               massData.center.setV(this.m_p);
               massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y));
            }


   		}).call(CircleShape.prototype);
   		module.exports = CircleShape;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/collision/shapes/b2MassData", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var Vec2 = require("../../common/math/b2Vec2")
   			, Shape = require("./b2Shape")
   			, latte_lib = require("latte_lib");
   		var MassData = function() {
   			this.mass = 0.0;
   			this.center = new Vec2(0, 0);
   			this.I = 0.0;
   		};
   		latte_lib.inherits(MassData, Shape);
   		(function() {
   			this.init = function() {
   				Shape.call(this, arguments);
   			}
   		}).call(MassData.prototype);
   		module.exports = MassData;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2PolygonShape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Shape = require("./b2Shape")
 			, b2Vec2 = require("../../common/math/b2Vec2");
 		//多边形
 		var b2PolygonShape = function() {
 			b2Shape.apply(this, arguments);
 			this.init();
 		};
 		latte_lib.inherits(b2PolygonShape, b2Shape);
 		(function() {
 			this.init = function() {
 				b2Shape.call(this);
 				this.m_type = b2Shape.e_polygonShape;
 				this.m_centroid = new b2Vec2();
 				this.m_vertices = new Array();
 				this.m_normals = new Array();
 			}

 			//预留 
 			this.Reserve = function(count) {
 				if(count === undefined) count = 0;
 				for (var i = parseInt(this.m_vertices.length); i < count; i++) {
			        this.m_vertices[i] = new b2Vec2();
			        this.m_normals[i] = new b2Vec2();
		      	}
 			}

 			this.SetAsBox = function(hx, hy) {
 				if(hx === undefined) hx = 0;
 				if(hy === undefined) hy = 0;
 				this.m_vertexCount = 4;
 				this.Reserve(4);
 				this.m_vertices[0].Set((-hx), (-hy));
				this.m_vertices[1].Set(hx, (-hy));
				this.m_vertices[2].Set(hx, hy);
				this.m_vertices[3].Set((-hx), hy);
				this.m_normals[0].Set(0.0, (-1.0));
				this.m_normals[1].Set(1.0, 0.0);
				this.m_normals[2].Set(0.0, 1.0);
				this.m_normals[3].Set((-1.0), 0.0);
				this.m_centroid.SetZero();
 			}
 		}).call(b2PolygonShape.prototype);
 		module.exports = b2PolygonShape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/collision/shapes/b2Shape", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//多边形
 		var b2Shape = function() {
 			
 		};
 		(function() {

 		}).call(b2Shape.prototype);
 		(function() {
 			this.e_unknownShape = parseInt((-1));
		      this.e_circleShape = 0;
		      this.e_polygonShape = 1;
		      this.e_edgeShape = 2;
		      this.e_shapeTypeCount = 3;
		      this.e_hitCollide = 1;
		      this.e_missCollide = 0;
		      this.e_startsInsideCollide = parseInt((-1));
 		}).call(b2Shape);
 		module.exports = b2Shape;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/b2Color", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_box2d = require("latte_box2d")
   			, mMath = require("./math/math");

   		var Color = function(rr,gg,bb) {
   			this.init(rr,gg,bb);
   		};
   		(function(){
            Object.defineProperty(this, 'color', {
               enumerable: false,
               configurable: true,
               get: function () {
                  return (this._r << 16) | (this._g << 8) | (this._b);
               }
            });
   			this.set = this.init = function(rr, gg, bb) {
   				rr = rr || 0;
   				gg = gg || 0;
   				bb = bb || 0;
   				this._r = latte_box2d.parseUInt(255 * mMath.clamp(rr, 0.0, 1.0));
   				this._g = latte_box2d.parseUInt(255 * mMath.clamp(gg, 0.0, 1.0));
   				this._b = latte_box2d.parseUInt(255 * mMath.clamp(bb, 0.0, 1.0));
   			}
   		}).call(Color.prototype);
   		module.exports = Color;
  	
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

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

			this.assert = function(a) {
				if(!a) {
					throw "Assertion Failed";
				}
			}
   		}).call(Settings);
   		module.exports = Settings;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Mat22", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2");
 		//存角度的
 		var b2Mat22 = function() {
 			this.col1 = new b2Vec2();
 			this.col2 = new b2Vec2();
 		};
 		(function() {
 			this.init = this.SetIdentity = function() {
 				this.col1.x = 1.0;
 				this.col2.x = 0.0;
 				this.col1.y = 0.0;
 				this.col2.y = 1.0;
 			}
 			this.SetZero = function() {
 				this.col1.x = 0.0;
 				this.col2.x = 0.0;
 				this.col1.y = 0.0;
 				this.col2.x = 0.0;
 			}
 			this.FromAngle = function(angle) {
 				if(angle === undefined) angle = 0;
 				var mat = new b2Mat22();
 				mat.Set(angle);
 				return mat;
 			}

 			this.FromVV = function(c1, c2) {
 				var mat = new b2Mat22();
 				mat.SetVV(c1, c2);
 				return mat;
 			}
 			this.Set = function(angle) {
 				if(angle === undefined) angle = 0;
 				var c = Math.cos(angle);
 				var s = Math.sin(angle);
 				this.col1.x = c;
 				this.col2.x = (-s);
 				this.col1.y = s;
 				this.col2.y = c;
 			}
 			this.SetVV = function(c1, c2) {
 				this.col1.SetV(c1);
 				this.col2.SetV(c2);
 			}
 			this.Copy = function() {
 				var mat = new b2Mat22();
		      	mat.SetM(this);
		      	return mat;
 			}
 		}).call(b2Mat22.prototype);
 		module.exports = b2Mat22;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Math", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Math = function() {

 		};
 		(function() {

 		}).call(b2Math.prototype);
 		(function() {
 			this.IsValid = function(x) {
 				if(x === undefined) x = 0;
 				return isFinite(x);
 			}
 			this.Dot = function(a, b) {
 				return a.x * b.x + a.y * b.y;
 			}
 			this.CrossVV = function(a, b) {
 				return a.x * b.y - a.y * b.x;
 			}
 			/**
 			this.CrossVF = function(a, s) {
 				if (s === undefined) s = 0;
				var v = new b2Vec2(s * a.y, (-s * a.x));
				return v;
 			}
 			this.CrossFV = function (s, a) {
		      if (s === undefined) s = 0;
		      var v = new b2Vec2((-s * a.y), s * a.x);
		      return v;
		    }*/
 		}).call(b2Math);
 		module.exports = b2Math;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Sweep", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2");
 		var b2Sweep = function() {
 			this.localCenter = new b2Vec2();
 			this.c0 = new b2Vec2();
 			this.c = new b2Vec2();
 		};
 		(function() {
 			this.Set = function(other) {
 				this.localCenter.SetV(other.localCenter);
 				this.c0.SetV(other.c0);
 				this.c.SetV(other.c);
 				this.a0 = other.a0;
 				this.a = other.a;
 				this.t0 = other.t0;
 			}
 			this.Copy = function() {
 				var copy = new b2Sweep();
 				copy.Set(this);
 				return this;
 			}
 			//
 			this.GetTransform = function(xf, alpha) {
 				if(alpha === undefined) alpha = 0;
 				xf.position.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
 				xf.position.y = (1.0 - alpha) * this.c0.y + alpha * this.c.y;
 				var angle = (1.0 - alpha) * this.a0 + alpha * this.a;
 				xf.R.Set(angle);
 				var tMat = xf.R;
 				xf.position.x -= (tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y);
 				xf.position.y -= (tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y);
 			}
 			this.Advance = function(t) {
 				if(t === undefined) t = 0;
 				if(this.t0 < t && 1.0 - this.t0 > Number.MIN_VALUE) {
 					var alpha = (t - this.t0)/ (1.0 - this.t0);
 					this.c0.x = (1.0 - alpha) * this.c0.x + alpha * this.c.x;
 					this.c0.y = (1.0 - alpha) * this.c0.y + alpha * tihs.c.y;
 					this.a0 = (1.0 -alpha) * this.a0 + alpha * this.a;
 					this.t0 = t;
 				}
 			}
 			
 		}).call(b2Sweep.prototype);
 		module.exports = b2Sweep;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Transform", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("./b2Vec2")
 			, b2Mat22 = require("./b2Mat22");
 		var b2Transform = function(pos, r) {
 			this.position = new b2Vec2();
 			this.R = new b2Mat22();
 			this.init(pos, r);
 		};
 		(function() {
 			this.init = function(pos, r) {
 				if(pos === undefined) pos = null;
 				if(r === undefined) r = null;
 				if(pos) {
 					this.position.SetV(pos);
 					this.R.SetM(r);
 				}
 			}
 			this.SetIdentity = function() {
 				this.position.SetZero();
 				this.R.setIdentity();
 			}
 			this.Set = function(x) {
 				this.position.SetV(x.position);
 				this.R.SetM(x.R);
 			}
 			//atan2(y,x)所表达的意思是坐标原点为起点，指向(x,y)的射线在坐标平面上与x轴正方向之间的角的角度。
 			this.GetAngle = function() {
 				return Math.atan2(this.R.col1.y, this.R.col1.x);
 			}
 		}).call(b2Transform.prototype);
 		module.exports = b2Transform;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Vec2", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = function(x, y) {
 			this.Set(x,y);
 		};
 		(function() {
 			this.Set = function(x, y) {
 				if(x === undefined) x = 0;
 				if(y === undefined) y = 0;
 				this.x = x;
 				this.y = y;
 			}
 			this.SetZero = function(x,y) {
 				this.x = 0.0;
 				this.y = 0.0;
 			}
 			this.SetV = function(v) {
 				this.x = v.x;
 				this.y = v.y;
 			}
 			this.GetMegative = function() {
 				return new b2Vec2((-this.x), (-this.y));
 			}
 			this.NegativeSelf = function() {
 				this.x = (-this.x);
 				this.y = (-this.y);
 			}
 			this.Copy = function(x, y) {
 				return new b2Vec2(this.x, this.y)
 			}
 			this.Add = function(v) {
 				this.x += v.x;
 				this.y += v.y;
 			}
 			this.Subtract = function(v) {
 				this.x -= v.x;
      			this.y -= v.y;
 			}
 			this.Multiply = function(a) {
 				if(a === undefined) a = 0;
 				this.x *= a;
 				this.y *= a;
 			}
 			/**
 			this.MulM = function(A) {
 				var tX = this.x;
 				this.x = A.col1.x * tX + A.col2.x * this.y;
 				this.y = A.col1.y * tX + A.col2.y * this.y;
 			}
 			this.MulTM = function(A) {
 				var tX = b2Math.Dot(this, A.col1);
		      	this.y = b2Math.Dot(this, A.col2);
		      	this.x = tX; 
 			}
 			this.CrossVF = function(s) {
 				if( s === undefined ) s = 0;
 				var tX = this.x;
 				this.x = s * this.y;
 				this.y = (-s * tX);
 			}
 			this.CrossFV = function(s) {
 				if(s === undefined) s = 0;
 				var tX = this.x;
 				this.x = (-s * this.y);
 				this.y = s * tX;
 			}
 			*/
 			this.MinV = function(b) {
 				this.x = Math.min(this.x, b.x);
 				this.y = Math.min(this.y, b.y);
 			}
 			this.MaxV = function(b) {
 				this.x = Math.max(this.x, b.x);
 				this.y = Math.max(this.y, b.y);
 			}
 			this.Abs = function() {
 				this.x = Math.abs(this.x);
 				this.y = Math.abs(this.y);
 			}
 			this.Length = function() {
 				return Math.sqrt(this.x * this.x + this.y * this.y);
 			}
 			this.LengthSquared = function() {
 				return (this.x * this.x + this.y * this.y);
 			}
 			this.Normalize = function() {
 				var length = this.Length();
 				if(length < Number.MIN_VALUE) {
 					return 0.0;
 				}
 				var invLength = 1.0/length;
 				this.x *= invLength;
      			this.y *= invLength;
 				return length;
 			}
 			this.IsValid = function() {
 				return isFinite(this.x) && isFinite(this.y);
 			}
 		}).call(b2Vec2.prototype);
 		(function() {
 			this.create = this.Make = function(x,y) {
 				return new b2Vec2(x,y);
 			}
 		}).call(b2Vec2);
 		module.exports = b2Vec2;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/common/math/b2Vec3", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec3 = function() {

 		};
 		(function() {

 		}).call(b2Vec3.prototype);
 		module.exports = b2Vec3;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2Body", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Transform = require("../common/math/b2Transform")
 			, b2Sweep = require("../common/math/b2Sweep")
 			, b2Vec2 = require("../common/math/b2Vec2");

 		var b2Body = function(bd, world) {
 			this.m_xf = new b2Transform();
 			this.m_sweep = new b2Sweep();
 			this.m_linearVelocity = new b2Vec2();
 			this.m_force = new b2Vec2();

 			this.init(bd,world);
 		};
 		(function() {
 			this.init = function(bd, world) {
 				this.m_flags = 0;
 				if(bd.bullet) {
 					this.m_flags |= b2Body.e_bulletFlag;
 				}
 				if(bd.fixedRotation) {
 					this.m_flags |= b2Body.e_fixedRotationFlag;
 				}
 				if(bd.allowSleep) {
 					this.m_flags |= b2Body.e_allowSleepFlag;
 				}
 				if (bd.awake) {
		         	this.m_flags |= b2Body.e_awakeFlag;
		      	}
		      	if (bd.active) {
		         	this.m_flags |= b2Body.e_activeFlag;
		      	}

		      	this.m_world = world;
		      	//设置坐标
		      	this.m_xf.position.SetV(bd.position);
		      	//设置角度
		      	this.m_xf.R.Set(bd.angle);
		      	
		      	this.m_sweep.localCenter.SetZero();
		      	this.m_sweep.t0 = 1.0;
		      	this.m_sweep.a0 = this.m_sweep.a = bd.angle;
		      	var tMat = this.m_xf.R;
		      	var tVec = this.m_sweep.localCenter;
		      	this.m_sweep.c.x = (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
		      	this.m_sweep.c.y = (tMat.col1.y * tVec.y + tMat.col2.y * tVec.y);
		      	this.m_sweep.c.x += this.m_xf.position.x;
		      	this.m_sweep.c.y += this.m_xf.position.y;
		      	this.m_sweep.c0.SetV(this.m_sweep.c);
		      	this.m_jointList = null;
		      	this.m_controllerList = null;
		      	this.m_contactList = null;
		      	this.m_controllerCount = 0;
		      	this.m_prev = null;
		      	this.m_next = null;
		      	this.m_linearVelocity.SetV(bd.linearVelocity);
		      	this.m_angularVelocity = bd.angularVelocity;
		      	this.m_linearDamping = bd.linearDamping;
		      	this.m_angularDamping = bd.angularDamping;
		      	this.m_force.Set(0.0,0.0);
		      	this.m_torque = 0.0;
		      	this.m_sleepTime = 0.0;
		      	this.m_type = bd.type;
		      	if(this.m_type == b2Body.b2_dynamicBody) {
		      		this.m_mass = 1.0;
		      		this.m_invMass = 1.0;
		      	}
		      	this.m_I = 0.0;
      			this.m_invI = 0.0;
		      	this.m_inertiaScale = bd.inertiaScale;
		      	this.m_userData = bd.userData;
		      	this.m_fixtureList = null;
		      	this.m_fixtureCount = 0;

 			}
 			this.createFixture = function(def) {
 				if(this.m_world.IsLocked() == true) {
 					return null;
 				}
 				var fixture = new b2Fixture();
			      fixture.Create(this, this.m_xf, def);
			      if (this.m_flags & b2Body.e_activeFlag) {
			         var broadPhase = this.m_world.m_contactManager.m_broadPhase;
			         fixture.CreateProxy(broadPhase, this.m_xf);
			      }
			      fixture.m_next = this.m_fixtureList;
			      this.m_fixtureList = fixture;
			      ++this.m_fixtureCount;
			      fixture.m_body = this;
			      if (fixture.m_density > 0.0) {
			         this.ResetMassData();
			      }
			      this.m_world.m_flags |= b2World.e_newFixture;
			      return fixture;
 			}
 		}).call(b2Body.prototype);
 		(function() {
 			this.b2_staticBody = 0;// 静态
 			this.b2_kinematicBody = 1;//动态物体
 			this.b2_dynamicBody = 2;//运动学物体

 		}).call(b2Body);
 		module.exports = b2Body;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2BodyDef", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../common/math/b2Vec2");
 		var b2BodyDef = function() {
 			this.position = new b2Vec2();
 			this.linearVelocity = new b2Vec2();
 		};
 		(function() {
 			this.init = function() {
 				this.userData = null;
 				this.position.Set(0.0,0.0);
 				this.angle = 0.0;
 				this.linearVelocity.set(0,0);
 				this.angularDamping = 0.0;
 				this.allowSleep = true;
 				this.awake = true;
 				this.fixedRotation = false;
 				this.bullet = false;
 				this.type = b2Body.b2_staticBody;
 				this.active = true;
 				this.inertiaScale = 1.0;
 			}
 		}).call(b2BodyDef.prototype);
 		module.exports = b2BodyDef;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactFilter", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   	var ContactFilter = function() {

   	};
   	(function() {
         /**
            是否碰撞
            @method shouldCollide

         */
   		this.shouldCollide = function(fixtureA, fixtureB) {
            var filter1 = fixtureA.getFilterData();
            var filter2 = fixtureB.getFilterData();
            if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
               return filter1.groupIndex > 0;
            }
            return (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
            
         }
    	}).call(ContactFilter.prototype);
   	(function() {
   		this.defaultFilter = new ContactFilter();
   	}).call(ContactFilter);
   	module.exports = ContactFilter;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactListener", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var ContactListener = function() {

	   	};
	   	(function() {
	   		this.preSolve = function(contact, oldManifold) {

	   		}
	   	}).call(ContactListener.prototype);
	   	ContactListener.defaultListener = new ContactListener();
	   	module.exports = ContactListener;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactManager", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
   		var contactFilter = require("./b2ContactFilter")
   			, contactListener = require("./b2ContactListener")
   			, contactFactory = require("./contacts/b2ContactFactory")
   			, dynamicTreeBroadPhase = require("../collision/b2DynamicTreeBroadPhase")
            , Fixture = require("./b2Fixture")
            , Contact = require("./contacts/b2Contact");
            /**
               @module 类
               @namespace dynamics
               @class ContactManager
            */

            /**
               @property m_broadPhase
               @type {collision.dynamicTreeBroadPhase}
            */
            /**
               @property m_contactFactory
               @type {dynamics.contacts.contactFactory}
            */
   		var ContactManager = function() {
   			this.init();
   		};
   		(function(){
   			this.init = function() {
   				this.m_world = null;
   				this.m_contactCount = 0;
   				this.m_contactFilter = contactFilter.defaultFilter;
   				this.m_contactListener = contactListener.defaultListener;
   				this.m_contactFactory = new contactFactory(this.m_allocator);
   				this.m_broadPhase = new dynamicTreeBroadPhase();
   			}
            /**
               碰撞
               @method collide
            */
            this.collide = function() {
               var c = this.m_world.m_contactList;
               while(c) {
                  var fixtureA = c.getFixtureA();
                  var fixtureB = c.getFixtureB();
                  var bodyA = fixtureA.getBody();
                  var bodyB = fixtureB.getBody();
                  if(bodyA.isAwake() == false && bodyB.isAwake() == false) {
                     c = c.getNext();
                     continue;
                  }
                  if(c.m_flags & Contact.e_filterFlag) {
                     if(bodyB.shouldCollide(bodyA) == false) {
                        var cNuke = c;
                        c = cNuke.getNext();
                        this.destroy(cNuke);
                        continue;
                     }
                     if(this.m_contactFilter.shouldCollide(fixtureA, fixtureB) == false) {
                        cNuke = c;
                        c = cNuke.getNext();
                        this.destroy(cNuke);
                        continue;
                     }
                     c.m_flags &= ~Contact.e_filterFlag;
                  }
                  var proxyA = fixtureA.m_proxy;
                  var proxyB = fixtureB.m_proxy;
                  var overlap = this.m_broadPhase.testOverlap(proxyA, proxyB);
                  if(overlap == false) {
                     cNuke = c;
                     c = cNuke.getNext();
                     this.destroy(cNuke);
                     continue;
                  }
                  c.update(this.m_contactListener);
                  c = c.getNext();
               }
            }
            /**

            */
            this.findNewContacts = function() {
               var self = this;
               this.m_broadPhase.updatePairs(function () {
                  self.addPair.apply(self, arguments);
               });
               //this.m_broadPhase.updatePairs(this.addPair.bind(this));
            }
            /**

            */
            this.addPair = function(proxyUserDataA, proxyUserDataB) {
               var fixtureA = (proxyUserDataA instanceof Fixture ? proxyUserDataA : null);
               var fixtureB = (proxyUserDataB instanceof Fixture ? proxyUserDataB : null);
               var bodyA = fixtureA.getBody();
               var bodyB = fixtureB.getBody();
               if(bodyA == bodyB) return;
               var edge = bodyB.getContactList();
               while(edge) {
                  if(edge.other == bodyA) {
                     var fA = edge.contact.getFixtureA();
                     var fB = edge.contact.getFixtureB();
                     if(fA == fixtureA && fB == fixtureB) return;
                     if(fA == fixtureB && fB == fixtureA) return;
                  }
                  edge = edge.next;
               }
               if(bodyB.shouldCollide(bodyA) == false) {
                  return;
               }
               if(this.m_contactFilter.shouldCollide(fixtureA, fixtureB) == false) {
                  return;
               }

               var c = this.m_contactFactory.create(fixtureA, fixtureB);
               fixtureA = c.getFixtureA();
               fixtureB = c.getFixtureB();
               bodyA = fixtureA.m_body;
               bodyB = fixtureB.m_body;
               c.m_prev = null;
               c.m_next = this.m_world.m_contactList;
               if(this.m_world.m_contactList != null) {
                  this.m_world.m_contactList.m_prev = c;
               }
               this.m_world.m_contactList = c;
               c.m_nodeA.contact = c;
               c.m_nodeA.other = bodyB;
               c.m_nodeA.prev = null;
               c.m_nodeA.next = bodyA.m_contactList;
               if(bodyA.m_contactList != null) {
                  bodyA.m_contactList.prev = c.m_nodeA;
               }
               bodyA.m_contactList = c.m_nodeA;
               c.m_nodeB.contact = c;
               c.m_nodeB.other = bodyA;
               c.m_nodeB.prev = null;
               c.m_nodeB.next = bodyB.m_contactList;
               if(bodyB.m_contactList != null) {
                  bodyB.m_contactList.prev = c.m_nodeB;
               }
               bodyB.m_contactList = c.m_nodeB;
               ++this.m_world.m_contactCount;
               return;
            }

   		}).call(ContactManager.prototype);
         (function(){
            //this.s_evalCP = new ContactPoint();
         }).call(ContactManager);
   		module.exports = ContactManager;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2ContactSolver", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {

         /**
            @property m_step
            @type {dynamics.timeStep}
         */
         /**
            @property m_constranints
            @type {Array}
         */
         var TimeStep = require("./b2TimeStep")
            , ContactConstraint= require("./contacts/b2ContactConstraint")
            , Settings = require("../common/b2Settings");
   		var ContactSolver = function() {
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_step = new TimeStep();
   				this.m_constraints = new Array();
   			}

            this.initialize = function(step, contacts, contactCount, allocator) {
               if (contactCount === undefined) contactCount = 0;
               var contact;
               this.m_step.set(step);
               this.m_allocator = allocator;
               var i = 0;
               var tVec;
               var tMat;
               this.m_constraintCount = contactCount;
               while (this.m_constraints.length < this.m_constraintCount) {
                  this.m_constraints[this.m_constraints.length] = new ContactConstraint();
               }
               for (i = 0;i < contactCount; ++i) {
                  contact = contacts[i];
                  var fixtureA = contact.m_fixtureA;
                  var fixtureB = contact.m_fixtureB;
                  var shapeA = fixtureA.m_shape;
                  var shapeB = fixtureB.m_shape;
                  var radiusA = shapeA.m_radius;
                  var radiusB = shapeB.m_radius;
                  var bodyA = fixtureA.m_body;
                  var bodyB = fixtureB.m_body;
                  var manifold = contact.GetManifold();
                  var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
                  var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
                  var vAX = bodyA.m_linearVelocity.x;
                  var vAY = bodyA.m_linearVelocity.y;
                  var vBX = bodyB.m_linearVelocity.x;
                  var vBY = bodyB.m_linearVelocity.y;
                  var wA = bodyA.m_angularVelocity;
                  var wB = bodyB.m_angularVelocity;
                  b2Settings.b2Assert(manifold.m_pointCount > 0);
                  b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
                  var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
                  var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
                  var cc = this.m_constraints[i];
                  cc.bodyA = bodyA;
                  cc.bodyB = bodyB;
                  cc.manifold = manifold;
                  cc.normal.x = normalX;
                  cc.normal.y = normalY;
                  cc.pointCount = manifold.m_pointCount;
                  cc.friction = friction;
                  cc.restitution = restitution;
                  cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
                  cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
                  cc.localPoint.x = manifold.m_localPoint.x;
                  cc.localPoint.y = manifold.m_localPoint.y;
                  cc.radius = radiusA + radiusB;
                  cc.type = manifold.m_type;
                  for (var k = 0; k < cc.pointCount; ++k) {
                     var cp = manifold.m_points[k];
                     var ccp = cc.points[k];
                     ccp.normalImpulse = cp.m_normalImpulse;
                     ccp.tangentImpulse = cp.m_tangentImpulse;
                     ccp.localPoint.SetV(cp.m_localPoint);
                     var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
                     var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
                     var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
                     var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
                     var rnA = rAX * normalY - rAY * normalX;
                     var rnB = rBX * normalY - rBY * normalX;
                     rnA *= rnA;
                     rnB *= rnB;
                     var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
                     ccp.normalMass = 1.0 / kNormal;
                     var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
                     kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
                     ccp.equalizedMass = 1.0 / kEqualized;
                     var tangentX = normalY;
                     var tangentY = (-normalX);
                     var rtA = rAX * tangentY - rAY * tangentX;
                     var rtB = rBX * tangentY - rBY * tangentX;
                     rtA *= rtA;
                     rtB *= rtB;
                     var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
                     ccp.tangentMass = 1.0 / kTangent;
                     ccp.velocityBias = 0.0;
                     var tX = vBX + ((-wB * rBY)) - vAX - ((-wA * rAY));
                     var tY = vBY + (wB * rBX) - vAY - (wA * rAX);
                     var vRel = cc.normal.x * tX + cc.normal.y * tY;
                     if (vRel < (-b2Settings.b2_velocityThreshold)) {
                        ccp.velocityBias += (-cc.restitution * vRel);
                     }
                  }
                  if (cc.pointCount == 2) {
                     var ccp1 = cc.points[0];
                     var ccp2 = cc.points[1];
                     var invMassA = bodyA.m_invMass;
                     var invIA = bodyA.m_invI;
                     var invMassB = bodyB.m_invMass;
                     var invIB = bodyB.m_invI;
                     var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
                     var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
                     var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
                     var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
                     var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
                     var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
                     var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
                     var k_maxConditionNumber = 100.0;
                     if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                        cc.K.col1.Set(k11, k12);
                        cc.K.col2.Set(k12, k22);
                        cc.K.GetInverse(cc.normalMass);
                     }
                     else {
                        cc.pointCount = 1;
                     }
                  }
               }
            }

            this.solveVelocityConstraints = function() {
               var j = 0
                  , ccp
                  , rAX = 0
                  , rAY = 0
                  , rBX = 0
                  , rBY = 0
                  , dvX = 0
                  , dvY = 0
                  , vn  = 0
                  , vt  = 0
                  , lambda = 0
                  , maxFriction = 0
                  , newImpulse = 0
                  , PX = 0
                  , PY = 0
                  , dX = 0
                  , dY = 0
                  , P1X = 0
                  , P1Y = 0
                  , P2X = 0
                  , P2Y = 0
                  , tMat 
                  , tVec;
                  for(var i = 0; i < this.m_constraintCount; ++i) {
                     var c = this.m_constranints[i]
                        , bodyA = c.bodyA
                        , bodyB = c.bodyB
                        , wA = bodyA.m_angularVelocity
                        , wB = bodyB.m_angularVelocity
                        , vA = bodyA.m_linearVelocity
                        , vB = bodyB.m_linearVelocity
                        , invMassA = bodyA.m_invMass
                        , invIA = bodyA.m_invI
                        , invMassB = bodyB.m_invMass
                        , invIB = bodyB.m_invI
                        , normalX = c.normal.x
                        , normalY = c.normal.y
                        , tangentX = normalX
                        , tangentY = -normalX
                        , friction = c.friction
                        , tX = 0;
                     for( j = 0; j < c.pointCount; j++) {
                        ccp = c.points[j];
                        dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
                        dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
                        vt = dvX * tangentX + dvY * tangentY;
                        lambda = ccp.tangentMass * (-vt);
                        maxFriction = friction * ccp.normalImpulse;
                        newImpulse = mMath.clamp(ccp.tangentImpulse + lambda, (-maxFriction), maxFriction);
                        lambda = newImpulse - ccp.tangentImpulse;
                        PX = lambda * tangentX;
                        PY = lambda * tangentY;
                        vA.x -= invMassA * PX;
                        vA.y -= invMassA * PY;
                        wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
                        vB.x += invMassB * PX;
                        vB.y += invMassB * PY;
                        wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
                        ccp.tangentImpulse = newImpulse;
                     }
                     var tCount = parseInt(c.pointCount);
                     if(c.pointCount == 1) {
                        ccp = c.points[0];
                        dvX = vB.x + ((-wB * ccp.rB.y)) - vA.x - ((-wA * ccp.rA.y));
                        dvY = vB.y + (wB * ccp.rB.x) - vA.y - (wA * ccp.rA.x);
                        vn = dvX * normalX + dvY * normalY;
                        lambda = (-ccp.normalMass * (vn - ccp.velocityBias));
                        newImpulse = ccp.normalImpulse + lambda;
                        newImpulse = newImpulse > 0 ? newImpulse : 0.0;
                        lambda = newImpulse - ccp.normalImpulse;
                        PX = lambda * normalX;
                        PY = lambda * normalY;
                        vA.x -= invMassA * PX;
                        vA.y -= invMassA * PY;
                        wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
                        vB.x += invMassB * PX;
                        vB.y += invMassB * PY;
                        wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
                        ccp.normalImpulse = newImpulse;
                     } else {
                        var cp1 = c.points[0];
                        var cp2 = c.points[1];
                        var aX = cp1.normalImpulse;
                        var aY = cp2.normalImpulse;
                        var dv1X = vb.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
                        var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
                        var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
                        var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
                        var vn1 = dv1X * normalX + dv1Y * normalY;
                        var vn2 = dv2X * normalX + dv2Y * normalY;
                        var bX = vn1 - cp1.velocityBias;
                        var bY = vn2 - cp2.velocityBias;
                        tMat = c.K;
                        bX -= tMat.col1.x * aX + tMat.col2.x * aY;
                        bY -= tMat.col1.y * aX + tMat.col2.y * aY;
                        var k_errorTol = 0.001;
                        for (;;) {
                           tMat = c.normalMass;
                           var xX = (-(tMat.col1.x * bX + tMat.col2.x * bY));
                           var xY = (-(tMat.col1.y * bX + tMat.col2.y * bY));
                           if (xX >= 0.0 && xY >= 0.0) {
                              dX = xX - aX;
                              dY = xY - aY;
                              P1X = dX * normalX;
                              P1Y = dX * normalY;
                              P2X = dY * normalX;
                              P2Y = dY * normalY;
                              vA.x -= invMassA * (P1X + P2X);
                              vA.y -= invMassA * (P1Y + P2Y);
                              wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                              vB.x += invMassB * (P1X + P2X);
                              vB.y += invMassB * (P1Y + P2Y);
                              wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                              cp1.normalImpulse = xX;
                              cp2.normalImpulse = xY;
                              break;
                           }
                           xX = (-cp1.normalMass * bX);
                           xY = 0.0;
                           vn1 = 0.0;
                           vn2 = c.K.col1.y * xX + bY;
                           if (xX >= 0.0 && vn2 >= 0.0) {
                              dX = xX - aX;
                              dY = xY - aY;
                              P1X = dX * normalX;
                              P1Y = dX * normalY;
                              P2X = dY * normalX;
                              P2Y = dY * normalY;
                              vA.x -= invMassA * (P1X + P2X);
                              vA.y -= invMassA * (P1Y + P2Y);
                              wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                              vB.x += invMassB * (P1X + P2X);
                              vB.y += invMassB * (P1Y + P2Y);
                              wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                              cp1.normalImpulse = xX;
                              cp2.normalImpulse = xY;
                              break;
                           }
                           xX = 0.0;
                           xY = (-cp2.normalMass * bY);
                           vn1 = c.K.col2.x * xY + bX;
                           vn2 = 0.0;
                           if (xY >= 0.0 && vn1 >= 0.0) {
                              dX = xX - aX;
                              dY = xY - aY;
                              P1X = dX * normalX;
                              P1Y = dX * normalY;
                              P2X = dY * normalX;
                              P2Y = dY * normalY;
                              vA.x -= invMassA * (P1X + P2X);
                              vA.y -= invMassA * (P1Y + P2Y);
                              wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                              vB.x += invMassB * (P1X + P2X);
                              vB.y += invMassB * (P1Y + P2Y);
                              wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                              cp1.normalImpulse = xX;
                              cp2.normalImpulse = xY;
                              break;
                           }
                           xX = 0.0;
                           xY = 0.0;
                           vn1 = bX;
                           vn2 = bY;
                           if (vn1 >= 0.0 && vn2 >= 0.0) {
                              dX = xX - aX;
                              dY = xY - aY;
                              P1X = dX * normalX;
                              P1Y = dX * normalY;
                              P2X = dY * normalX;
                              P2Y = dY * normalY;
                              vA.x -= invMassA * (P1X + P2X);
                              vA.y -= invMassA * (P1Y + P2Y);
                              wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
                              vB.x += invMassB * (P1X + P2X);
                              vB.y += invMassB * (P1Y + P2Y);
                              wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
                              cp1.normalImpulse = xX;
                              cp2.normalImpulse = xY;
                              break;
                           }
                           break;
                        } 
                     }
                     bodyA.m_angularVelocity = wA;
                     bodyB.m_angularVelocity = wB;
                  }
            }

            this.initVelocityConstraints = function(step, contacts, contactCount, allocator) {
               if (contactCount === undefined) contactCount = 0;
               var contact;
               this.m_step.set(step);
               this.m_allocator = allocator;
               var i = 0;
               var tVec;
               var tMat;
               this.m_constraintCount = contactCount;
               while (this.m_constraints.length < this.m_constraintCount) {
                  this.m_constraints[this.m_constraints.length] = new ContactConstraint();
               }
               for (i = 0; i < contactCount; ++i) {
                  contact = contacts[i];
                  var fixtureA = contact.m_fixtureA;
                  var fixtureB = contact.m_fixtureB;
                  var shapeA = fixtureA.m_shape;
                  var shapeB = fixtureB.m_shape;
                  var radiusA = shapeA.m_radius;
                  var radiusB = shapeB.m_radius;
                  var bodyA = fixtureA.m_body;
                  var bodyB = fixtureB.m_body;
                  var manifold = contact.GetManifold();
                  var friction = Settings.MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
                  var restitution = Settings.MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
                  var vAX = bodyA.m_linearVelocity.x;
                  var vAY = bodyA.m_linearVelocity.y;
                  var vBX = bodyB.m_linearVelocity.x;
                  var vBY = bodyB.m_linearVelocity.y;
                  var wA = bodyA.m_angularVelocity;
                  var wB = bodyB.m_angularVelocity;
                  Settings.Assert(manifold.m_pointCount > 0);
                  ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
                  var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
                  var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
                  var cc = this.m_constraints[i];
                  cc.bodyA = bodyA;
                  cc.bodyB = bodyB;
                  cc.manifold = manifold;
                  cc.normal.x = normalX;
                  cc.normal.y = normalY;
                  cc.pointCount = manifold.m_pointCount;
                  cc.friction = friction;
                  cc.restitution = restitution;
                  cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
                  cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
                  cc.localPoint.x = manifold.m_localPoint.x;
                  cc.localPoint.y = manifold.m_localPoint.y;
                  cc.radius = radiusA + radiusB;
                  cc.type = manifold.m_type;
                  for (var k = 0; k < cc.pointCount; ++k) {
                     var cp = manifold.m_points[k];
                     var ccp = cc.points[k];
                     ccp.normalImpulse = cp.m_normalImpulse;
                     ccp.tangentImpulse = cp.m_tangentImpulse;
                     ccp.localPoint.SetV(cp.m_localPoint);
                     var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
                     var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
                     var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
                     var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
                     var rnA = rAX * normalY - rAY * normalX;
                     var rnB = rBX * normalY - rBY * normalX;
                     rnA *= rnA;
                     rnB *= rnB;
                     var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
                     ccp.normalMass = 1.0 / kNormal;
                     var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
                     kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
                     ccp.equalizedMass = 1.0 / kEqualized;
                     var tangentX = normalY;
                     var tangentY = (-normalX);
                     var rtA = rAX * tangentY - rAY * tangentX;
                     var rtB = rBX * tangentY - rBY * tangentX;
                     rtA *= rtA;
                     rtB *= rtB;
                     var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
                     ccp.tangentMass = 1.0 / kTangent;
                     ccp.velocityBias = 0.0;
                     var tX = vBX + ((-wB * rBY)) - vAX - ((-wA * rAY));
                     var tY = vBY + (wB * rBX) - vAY - (wA * rAX);
                     var vRel = cc.normal.x * tX + cc.normal.y * tY;
                     if (vRel < (-b2Settings.b2_velocityThreshold)) {
                        ccp.velocityBias += (-cc.restitution * vRel);
                     }
                  }
                  if (cc.pointCount == 2) {
                     var ccp1 = cc.points[0];
                     var ccp2 = cc.points[1];
                     var invMassA = bodyA.m_invMass;
                     var invIA = bodyA.m_invI;
                     var invMassB = bodyB.m_invMass;
                     var invIB = bodyB.m_invI;
                     var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
                     var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
                     var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
                     var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
                     var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
                     var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
                     var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
                     var k_maxConditionNumber = 100.0;
                     if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                        cc.K.col1.Set(k11, k12);
                        cc.K.col2.Set(k12, k22);
                        cc.K.getInverse(cc.normalMass);
                     }
                     else {
                        cc.pointCount = 1;
                     }
                  }
               }

            }
            this.finalizeVelocityConstraints = function() {
               for (var i = 0; i < this.m_constraintCount; ++i) {
                  var c = this.m_constraints[i];
                  var m = c.manifold;
                  for (var j = 0; j < c.pointCount; ++j) {
                     var point1 = m.m_points[j];
                     var point2 = c.points[j];
                     point1.m_normalImpulse = point2.normalImpulse;
                     point1.m_tangentImpulse = point2.tangentImpulse;
                  }
               }
            }
            this.solvePositionConstraints = function(baumgarte) {
               if (baumgarte === undefined) baumgarte = 0;
               var minSeparation = 0.0;
               for (var i = 0; i < this.m_constraintCount; i++) {
                  var c = this.m_constraints[i];
                  var bodyA = c.bodyA;
                  var bodyB = c.bodyB;
                  var invMassA = bodyA.m_mass * bodyA.m_invMass;
                  var invIA = bodyA.m_mass * bodyA.m_invI;
                  var invMassB = bodyB.m_mass * bodyB.m_invMass;
                  var invIB = bodyB.m_mass * bodyB.m_invI;
                  ContactSolver.s_psm.initialize(c);
                  var normal = ContactSolver.s_psm.m_normal;
                  for (var j = 0; j < c.pointCount; j++) {
                     var ccp = c.points[j];
                     var point = ContactSolver.s_psm.m_points[j];
                     var separation = ContactSolver.s_psm.m_separations[j];
                     var rAX = point.x - bodyA.m_sweep.c.x;
                     var rAY = point.y - bodyA.m_sweep.c.y;
                     var rBX = point.x - bodyB.m_sweep.c.x;
                     var rBY = point.y - bodyB.m_sweep.c.y;
                     minSeparation = minSeparation < separation ? minSeparation : separation;
                     var C = mMath.clamp(baumgarte * (separation + Settings.linearSlop), (-Settings.maxLinearCorrection), 0.0);
                     var impulse = (-ccp.equalizedMass * C);
                     var PX = impulse * normal.x;
                     var PY = impulse * normal.y;bodyA.m_sweep.c.x -= invMassA * PX;
                     bodyA.m_sweep.c.y -= invMassA * PY;
                     bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
                     bodyA.synchronizeTransform();
                     bodyB.m_sweep.c.x += invMassB * PX;
                     bodyB.m_sweep.c.y += invMassB * PY;
                     bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
                     bodyB.synchronizeTransform();
                  }
               }
               return minSeparation > (-1.5 * Settings.b2_linearSlop);
            }
   		}).call(ContactSolver.prototype);
   		module.exports = ContactSolver;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2DebugDraw", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
      var DebugDraw = function() {
         this.m_drawScale = 1.0;
         this.m_lineThickness = 1.0;
         this.m_alpha = 1.0;
         this.m_fillAlpha = 1.0;
         this.m_xformScale = 1.0;
         var self = this;
         this.m_sprite = {
            graphics: {
               clear: function() {
                  self.m_ctx.clearRect(0,0, self.m_ctx.canvas.width, self.m_ctx.canvas.height);
               }
            }
         };
         this.init();
      };
      (function() {
         this.init = function() {
            this.m_drawFlags = 0;
         }
         /**
            @method setSprite
            @param sprite {canvas}
         */
         this.setSprite = function(sprite) {
            this.m_ctx = sprite;
         }
         /**
            设置放大缩小的尺寸
            @method setDrawScale
            @param drawScale {Number}
         */
         this.setDrawScale = function(drawScale) {
            if(drawScale === undefined) drawScale = 0;
            this.m_drawScale = drawScale;
         }
         /**
            设置填充透明度
            @method setFillAlpha
            @param alpha {Number}
         */
         this.setFillAlpha = function(alpha) {
            if(alpha === undefined) alpha = 0;
            this.m_fillAlpha = alpha;
         }
         /**
            设置线宽
            @method setLineThickness
            @param lineThickness {Number}
         */
         this.setLineThickness = function(lineThickness) {
            if(lineThickness === undefined) lineThickness = 0;
            this.m_lineThickness = lineThickness;
            this.m_ctx.strokeWidth = lineThickness;
         }

         /**
            @method setFlags
            @param flags {Number}
         */
         this.setFlags = function(flags) {
            if(flags === undefined) flags = 0;
            this.m_drawFlags = flags;
         }

         this.getFlags = function() {
            return this.m_drawFlags;
         }

         this.drawSolidCircle = function(center, radius, axis, color) {
            if (!radius) return;
            var s = this.m_ctx,
               drawScale = this.m_drawScale,
               cx = center.x * drawScale,
               cy = center.y * drawScale;
            s.moveTo(0, 0);
            s.beginPath();
            s.strokeStyle = this._color(color.color, this.m_alpha);
            s.fillStyle = this._color(color.color, this.m_fillAlpha);
            s.arc(cx, cy, radius * drawScale, 0, Math.PI * 2, true);
            s.moveTo(cx, cy);
            s.lineTo((center.x + axis.x * radius) * drawScale, (center.y + axis.y * radius) * drawScale);
            s.closePath();
            s.fill();
            s.stroke();
         }

         this._color = function (color, alpha) {
            return "rgba(" + ((color & 0xFF0000) >> 16) + "," + ((color & 0xFF00) >> 8) + "," + (color & 0xFF) + "," + alpha + ")";
         };
         this.drawSolidPolygon = function(vertices, vertexCount, color) {
            if (!vertexCount) return;
            var s = this.m_ctx;
            var drawScale = this.m_drawScale;
            s.beginPath();
            s.strokeStyle = this._color(color.color, this.m_alpha);
            s.fillStyle = this._color(color.color, this.m_fillAlpha);
            s.moveTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            for (var i = 1; i < vertexCount; i++) {
               s.lineTo(vertices[i].x * drawScale, vertices[i].y * drawScale);
            }
            s.lineTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            s.closePath();
            s.fill();
            s.stroke();
         }
      }).call(DebugDraw.prototype);
      (function() {
         this.e_shapeBit = 0x0001;
         this.e_jointBit = 0x0002;
         this.e_aabbBit = 0x0004;
         this.e_pairBit = 0x0008;
         this.e_centerOfMassBit = 0x0010;
         this.e_controllerBit = 0x0020;
      }).call(DebugDraw);
   	module.exports = DebugDraw;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2FilterData", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2FilterData = function() {
 			this.categoryBits = 0x0001;
 			this.maskBits = 0xFFFF;
 			this.groupIndex = 0;
 		};
 		(function() {
 			this.clone = function() {
 				var clone = new b2FilterData();
 				clone.categoryBits = 0x0001;
 				clone.maskBits = this.maskBits;
 				clone.groupIndex = this.groupIndex;
 				return clone;
 			}
 		}).call(b2FilterData.prototype);
 		module.exports = b2FilterData;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2Fixture", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var AABB = require("../collision/b2AABB")
            , MassData = require("../collision/shapes/b2MassData")
            , mMath = require("../common/math/b2Math");
   		/**
   			@module 类
   			@namespace dynamics
   			@class Fixture
   		*/
   		var FilterData = require("./b2FilterData");
   		/**
   			@property m_filter
   			@type {dynamics.filterData}
   		*/
         /**
            @property m_shape
            @type {collision.shapes.Shape}

         */
         /**
            @property m_body
            @type {dynamics.Body}
         */
   		var Fixture = function() {
   			this.m_filter = new FilterData();
            this.init();
         };
   		(function() {
            this.init = function() {
               this.m_aabb = new AABB();
               this.m_userData = null;
               this.m_body = null;
               this.m_next = null;
               this.m_shape = null;
               this.m_density = 0.0;
               this.m_friction = 0.0;
               this.m_restitution = 0.0;
            }
   			/**
   				#body->createFixture 
   				@method create
   				@param body {dynamics.Body}
   				@param xf {common.math.transform}
   				@param def {dynamics.fixtureDef}
   			*/
   			this.create = function(body, xf, def) {
   				this.m_userData = def.userData;
   				this.m_friction =  def.friction;
   				this.m_restitution = def.restitution;
   				this.m_body = body;
   				this.m_next = null;
   				this.m_filter = def.filter.copy();
   				this.m_isSensor = def.isSensor;
   				this.m_shape = def.shape.copy();
   				this.m_density = def.density;
   			}
   			/**
   				#body->createProxy
   				@method createProxy
   				@param  broadPhase {collision.DdynamicTreeBroadPhase}
   				@param  xf {common.math.Ttransform}
   			*/
   			this.createProxy = function(broadPhase, xf) {
   				this.m_shape.computeAABB(this.m_aabb, xf);
   				this.m_proxy = broadPhase.createProxy(this.m_aabb, this);
   			}

            this.getMassData = function(massData) {
               if(massData === undefined) massData = null;
               if(massData == null) {
                  massData = new MassData();
               }
               this.m_shape.computeMass(massData, this.m_density);
               return massData;
            }
            /**
            */
            this.getBody = function() {
               return this.m_body;
            }
            /**
               同步 world.solve->
               @method synchronize 

            */
            this.synchronize = function(broadPhase, transform1, transform2) {
               if (!this.m_proxy) return;
               var aabb1 = new AABB();
               var aabb2 = new AABB();
               this.m_shape.computeAABB(aabb1, transform1);
               this.m_shape.computeAABB(aabb2, transform2);
               this.m_aabb.combine(aabb1, aabb2);
               var displacement = mMath.subtractVV(transform2.position, transform1.position);
               broadPhase.moveProxy(this.m_proxy, this.m_aabb, displacement);
            }

            this.getShape = function() {
               return this.m_shape;
            }

            this.getFilterData = function(){
               return this.m_filter.copy();
            }
            /**
               获得类型
               @method getType 

            */
            this.getType = function() {
               return this.m_shape.getType();
            }

            this.isSensor = function() {
               return this.m_isSensor;
            }
   		}).call(Fixture.prototype);
        module.exports = Fixture;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2FixtureDef", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2FilterData = require("./b2FilterData");
 		var b2FixtureDef = function() {
 			this.filter = new b2FilterData();
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.shape = null;//形状
	 			this.userData = null;//数据
	 			this.friction = 0.2;//摩擦
	 			this.restitution = 0.0;//恢复
	 			this.density = 0.0;////密度
	 			this.filter.categoryBits = 0x0001;
	 			this.filter.groupIndex = 0;
	 			this.isSensor = false;
 			}
 		}).call(b2FixtureDef.prototype);
 		module.exports = b2FixtureDef;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2Island", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
         var Settings = require("../common/b2Settings")
            , mMath = require("../common/math/b2Math");
   		var Island = function() {
   			this.init();
   		};
   		(function() {
   			this.init = function() {
   				this.m_bodies = new Array();
	      		this.m_contacts = new Array();
	      		this.m_joints = new Array();
   			}

            this.initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
               if(bodyCapacity === undefined) bodyCapacity = 0;
               if(contactCapacity === undefined) contactCapacity = 0;
               if(jointCapacity === undefined) jointCapacity = 0;
               var i = 0;
               this.m_bodyCapacity = bodyCapacity;
               this.m_contactCapacity = contactCapacity;
               this.m_jointCapacity = jointCapacity;
               this.m_bodyCount = 0;
               this.m_contactCount = 0;
               this.m_jointCount = 0;
               this.m_allocator = allocator;
               this.m_listener = listener;
               this.m_contactSolver = contactSolver;
               for(i = this.m_bodies.length; i < bodyCapacity; i++) {
                  this.m_bodies[i] = null;
               }
               for( i = this.m_contacts.length; i < contactCapacity; i++) {
                  this.m_contacts[i] = null;
               }
               for( i = this.m_joints.length; i < jointCapacity; i++) {
                  this.m_joints[i] = null;
               }
            }

            this.clear = function() {
               this.m_bodyCount = 0;
               this.m_contactCount = 0;
               this.m_jointCount = 0;
            }
            /**
               @method addBody
               @param body {dynamics.Body}
            */
            this.addBody = function(body) {
               body.m_islandIndex = this.m_bodyCount;
               this.m_bodies[this.m_bodyCount++] = body;
            }
            /**
               @method solve
               @param step
               @param gravity
               @param allowSleep
            */
            this.solve = function(step, gravity, allowSleep) {
               var i = 0
                  , j = 0
                  , b , joint;
               for(i = 0; i < this.m_bodyCount ; ++i) {
                  b = this.m_bodies[i];
                  if(b.getType() != Body.dynamicBody) continue;
                  b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
                  b.m_linearVelocity.y += step.dt * (gravity.x + b.m_invMass * b.m_force.y);
                  b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
                  b.m_linearVelocity.multiply(mMath.clamp(1.0 - step.dt * b.m_linearDamping, 0.0, 1.0));
                  b.m_angularVelocity *= mMath.clamp(1.0 - step.dt * b.m_angularDamping, 0.0, 1.0);
               }
               this.m_contactSolver.initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
               var contactSolver = this.m_contactSolver;
               contactSolver.initVelocityConstraints(step);
               for( i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.initVelocityConstraints(step);
               }
               for(i = 0; i < step.velocityIterations; ++i) {
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     joint.solveVelocityConstraints(step);
                  }
                  contactSolver.solveVelocityConstraints();
               }
               for(i = 0; i < this.m_jointCount; ++i) {
                  joint = this.m_joints[i];
                  joint.finalizeVelocityConstraints();
               }
               contactSolver.finalizeVelocityConstraints();
               for(i = 0; i < this.m_bodyCount; ++i) {
                  b = this.m_bodies[i];
                  if(b.getType() == Body.staticBody) { continue; }
                  var translationX = step.dt * b.m_linearVelocity.x;
                  var translationY = step.dt * b.m_linearVelocity.y;
                  if((translationX * translationX + translationY * translationY) > Settings.maxTranslationSquared ) {
                     b.m_linearVelocity.normalize();
                     b.m_linearVelocity.x *= Settings.maxTranslation * step.inv_dt;
                     b.m_linearVelocity.y *= Settings.maxTranslation * step.inv_dt;
                  }
                  var rotation = step.dt * b.m_angularVelocity;
                  if(rotation * rotation > Settings.maxRotationSquared) {
                     
                        b.m_angularVelocity = 
                           b.m_angularVelocity < 0.0 ? 
                           (-Settings.maxRotation * step.inv_dt): 
                           Settings.maxRotation * step.inv_dt;
                     
                  }
                  b.m_sweep.c0.setV(b.m_sweep.c);
                  b.m_sweep.a0 = b.m_sweep.a;
                  b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
                  b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
                  b.m_sweep.a += step.dt * b.m_angularVelocity;

                  b.synchronizeTransform();
               }
               for(i = 0 ; i < step.positionIterations; ++i) {
                  var contactsOkay = contactSolver.solvePositionConstraints(Settings.b2_contactBaumgarte);
                  var jointsOkay = true;
                  for(j = 0; j < this.m_jointCount; ++j) {
                     joint = this.m_joints[j];
                     var jointOkay = joint.solvePositionConstraints(Settings.b2_contactBaumgarte);jointsOkay
                     jointsOkay = jointsOkay && jointOkay;
                  }
                  if(contactsOkay && jointsOkay) {
                     break;
                  }
               }
               this.report(contactSolver.m_constraints);
               if(allowSleep) {
                  var minSleepTime = Number.MAX_VALUE;
                  var linTolSqr = Settings.linearSlinearSleepTolerance * Settings.linearSlinearSleepTolerance;
                  var angTolSqr = Settings.angularSleepTolerance * Settings.angularSleepTolerance;
                  for( i = 0 ; i < this.m_bodyCount; ++i) {
                     b = this.m_bodies[i];
                     if(b.getType() == Body.staticBody) {
                        continue;
                     }
                     if((b.m_flags & Body.e_allowSleepFlag) == 0) {
                        b.m_sleepTime = 0.0;
                        minSleepTime = 0.0;
                     }
                     if((b.m_flags & Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || mMath.dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
                        b.m_sleepTime = 0.0;
                        minSleepTime = 0.0;
                     }else{
                        b.m_sleepTime += step.dt;
                        minSleepTime = mMath.min(minSleepTime, b.m_sleepTime);
                     }
                  }
                  if(minSleepTime >= Settings.timeToSleep) {
                     for( i = 0; i < this.m_bodyCount; ++i) {
                        b = this.m_bodies[i];
                        b.setAwake(false);
                     }
                  }
               }
            }
            /**
               island.solve -> Report
            */
            this.report = function(constraints) {
               if (this.m_listener == null) {
                  return;
               }
               for (var i = 0; i < this.m_contactCount; ++i) {
                  var c = this.m_contacts[i];
                  var cc = constraints[i];
                  for (var j = 0; j < cc.pointCount; ++j) {
                     Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
                     Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse;
                  }
                  this.m_listener.postSolve(c, Island.s_impulse);
               }     
            }
   		}).call(Island.prototype);
   		module.exports = Island;
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2TimeStep", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {

   		var TimeStep = function() {
   			
   		};
   		(function() {
   			this.set = function(step) {
               this.dt = step.dt;
               this.inv_dt = step.inv_dt;
               this.positionIterations = step.positionIterations;
               this.velocityIterations = step.velocityIterations;
               this.warmStarting = step.warmStarting;
            }
   		}).call(TimeStep.prototype);
   		module.exports = TimeStep;
   	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/b2World", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactManager = require("./b2ContactManager")
 			, b2ContactSolver = require("./b2ContactSolver")
 			, b2Island = require("./b2Island")
 			, b2Body = require("./b2Body");
 		var b2World = function() {
 			this.s_stack = new Array();
 			this.m_contactManager = new b2ContactManager();
 			this.m_contactSolver = new b2ContactSolver();
 			this.m_island = new b2Island();
 		};
 		(function() {
 			this.init = function() {
 				this.m_destructionListener = null;
 				this.m_debugDraw = null;
 				this.m_bodyList = null;
 				this.m_contactList = null;
 				this.m_jointList = null;
 				this.m_controllerCount = 0;
 				this.m_jointCount = 0;
 				this.m_controllerCount = 0;
 				b2World.m_warmStarting = true;
 				b2World.m_continuousPhysics = true;
 				this.m_allowSleep = doSleep;
 				this.m_gravity = gravity;
 				this.m_inv_dt0 = 0.0;
 				this.m_contactManager.m_world = this;
 				var bd = new b2BodyDef();
 				this.m_groundBody = this.CreateBody(bd);
 			}
 			this.CreateBody = function(def) {
 				if(this.IsLocked == true) { return null; }
 				var b = new b2Body(def, this);
 				b.m_prev = null;
 				b.m_next = this.m_bodyList;
 				if(this.m_bodyList) {
 					this.m_bodyList.m_prev = b;
 				}
 				this.m_bodyList = b ;
 				++this.m_bodyCount;
 				return b;
 			}
 			
 		}).call(b2World.prototype);
 		module.exports = b2World;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2CircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2CircleContact = function() {
 			
 		};
 		latte_lib.inherits(b2CircleContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      b2Collision.CollideCircles(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2CircleShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2CircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2CircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2CircleContact);
 		module.exports = b2CircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2Contact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		//基类
 		var b2ContactEdge = require("./b2ContactEdge")
 			, b2Manifold = require("../../collision/b2Manifold");
 		var b2Contact = function() {
 			this.m_nodeA = new b2ContactEdge();
 			this.m_nodeB = new b2ContactEdge();
 			this.m_manifold = new b2Manifold();
 			this.m_oldManifold = new b2Manifold();
 		};
 		(function() {
 			
 		}).call(b2Contact.prototype);
 		module.exports = b2Contact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactConstraint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2Vec2 = require("../../common/math/b2Vec2")
 			 ,b2Mat22 = require("../../common/math/b2Mat22")
 			 , b2Settings = require("../../common/b2Settings")
 			 , b2ContactConstraintPoint = require("./b2ContactConstraintPoint");
 		var b2ContactConstraint = function() {
 			this.localPlaneNormal = new b2Vec2();
 			this.localPoint = new b2Vec2();
 			this.normal = new b2Vec2();
 			this.normalMass = new b2Mat22();
 			this.K = new b2Mat22();
 			this.init();
 		};
 		(function() {
 			this.init = function() {
 				this.points = new Array(b2Settings.b2_maxManifoldPoints);
 				for(var i = 0; i <  b2Settings.b2_maxManifoldPoints; i++) {
 					this.points[i] = new b2ContactConstraintPoint();
 				}
 			}
 		}).call(b2ContactConstraint.prototype);
 		module.exports = b2ContactConstraint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactConstraintPoint", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactConstraintPoint = function() {
 			this.localPoint = new b2Vec2();
 			this.rA = new b2Vec2();
 			this.rB = new b2Vec2();
 		};
 		(function() {
 			
 		}).call(b2ContactConstraintPoint.prototype);
 		module.exports = b2ContactConstraintPoint;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactEdge", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var b2ContactEdge = function() {
 			
 		};
 		(function() {
 			
 		}).call(b2ContactEdge.prototype);
 		module.exports = b2ContactEdge;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/contacts/b2ContactFactory", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
      var b2Shape = require("../../collision/shapes/b2Shape")
         , b2CircleContact = require("./b2CircleContact")
         , b2ContactRegister = require("./b2ContactRegister")
         , b2PolyAndCircleContact = require("./b2PolyAndCircleContact")
         , b2PolygonContact = require("./b2PolygonContact")
         , b2EdgeAndCircleContact = require("./b2EdgeAndCircleContact")
         , b2PolyAndEdgeContact = require("./b2PolyAndEdgeContact");
   	var b2ContactFactory = function(allocator) {
   		this.init(allocator);
   	};
   	(function() {
   		this.init = function(allocator) {
   			this.m_allocator = allocator;
   			this.InitializeRegisters();
   		}
         /**
            是否碰撞
            @method shouldCollide

         */
   			this.AddType = function(createFcn, destroyFcn, type1, type2) {
	            if (type1 === undefined) type1 = 0;
		      	if (type2 === undefined) type2 = 0;
		      	this.m_registers[type1][type2].createFcn = createFcn;
		      	this.m_registers[type1][type2].destroyFcn = destroyFcn;
		      	this.m_registers[type1][type2].primary = true;
		      	if (type1 != type2) {
			         this.m_registers[type2][type1].createFcn = createFcn;
			         this.m_registers[type2][type1].destroyFcn = destroyFcn;
			         this.m_registers[type2][type1].primary = false;
		      	}
         	}
         	this.Create  = function(fixtureA, fixtureB) {
         		var type1 = parseInt(fixtureA.GetType());
         		var type2 = parseInt(fixtureB.GetType());
         		var reg = this.m_registers[typ1][type2];
         		var c;
         		if(reg.pool) {
         			c = reg.pool;
         			reg.pool = c.m_next;
         			reg.poolCount--;
         			c.Reset(fixtureA, fixtureB);
         			return c;
         		}
         		var createFcn = reg.createFcn;
         		if(createFcn != null) {
         			if(reg.primary) {
         				c = createFcn(this.m_allocator);
         				c.Reset(fixtureA, fixtureB);
         				return c;
         			}else{
         				c = createFcn(this.m_allocator);
         				c.Reset(fixtureB, fixtureA);
         				return c;
         			}
         		}else{
         			return null;
         		}
         	}
         	this.InitializeRegisters = function () {
			      this.m_registers = new Array(b2Shape.e_shapeTypeCount);
			      for (var i = 0; i < b2Shape.e_shapeTypeCount; i++) {
			         this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
			         for (var j = 0; j < b2Shape.e_shapeTypeCount; j++) {
			            this.m_registers[i][j] = new b2ContactRegister();
			         }
			      }
			      this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
			      this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
			      this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
			      this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
			      this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape);
		   	}
		   	this.Destroy = function(contact) {
		   		if(contact.m_manifold.m_pointCount > 0) {
		   			contact.m_fixtureA.m_body.SetAwake(true);
		   			contact.m_fixtureB.m_body.SetAwake(true);
		   		}
		   		var type1 = parseInt(contact.m_fixtureA.GetType());
		   		var type2 = parseInt(contact.m_fixtureB.GetType());
		   		var reg = this.m_registers[type1][type2];
		   		if(true) {
		   			reg.poolCount++;
		   			contact.m_next = reg.pool;
		   			reg.pool = contact;
		   		}
		   		var destroyFcn = reg.destroyFcn;
		   		destroyFcn(contact, this.m_allocator);
		   	}
    	}).call(b2ContactFactory.prototype);
   	(function() {
   		
   	}).call(b2ContactFactory);
   	module.exports = b2ContactFactory;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );
(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2ContactRegister", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2ContactRegister = function() {
 			
 		};
 		
 		module.exports = b2ContactRegister;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2EdgeAndCircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2EdgeAndCircleContact = function() {
 			
 		};
 		latte_lib.inherits(b2EdgeAndCircleContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		     var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      this.b2CollideEdgeAndCircle(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2EdgeShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2EdgeAndCircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2EdgeAndCircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2EdgeAndCircleContact);
 		module.exports = b2EdgeAndCircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolyAndCircleContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 		, b2Contact = require("./b2Contact");
 		var b2PolyAndCircleContact = function() {
 			
 		};
 		latte_lib.inherits(b2PolyAndCircleContact, b2Contact);
 		(function() {
 			this.Reset = function(fixtureA, fixtureB) {
 				b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
 				b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
 				b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape);
 			}
 			this.Evaluate = function () {
	      		var bA = this.m_fixtureA.m_body;
		      	var bB = this.m_fixtureB.m_body;
		      	b2Collision.CollidePolygonAndCircle(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2CircleShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   	}
 		}).call(b2PolyAndCircleContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolyAndCircleContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolyAndCircleContact);
 		module.exports = b2PolyAndCircleContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolyAndEdgeContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2PolyAndEdgeContact = function() {
 			
 		};
 		latte_lib.inherits(b2PolyAndEdgeContact, b2Contact);
 		(function() {
 			this.Reset = function (fixtureA, fixtureB) {
		      this.b2Contact.prototype.Reset.call(this, fixtureA, fixtureB);
		      b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
		      b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape);
		   }
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      this.b2CollidePolyAndEdge(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2EdgeShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
		   this.b2CollidePolyAndEdge = function (manifold, polygon, xf1, edge, xf2) {}
 		}).call(b2PolyAndEdgeContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolyAndEdgeContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolyAndEdgeContact);
 		module.exports = b2PolyAndEdgeContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/box/dynamics/contacts/b2PolygonContact", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib")
 			, b2Contact = require("./b2Contact");
 		var b2PolygonContact = function() {
 			
 		};
 		latte_lib.inherits(b2PolygonContact, b2Contact);
 		(function() {
 			this.Evaluate = function () {
		      var bA = this.m_fixtureA.GetBody();
		      var bB = this.m_fixtureB.GetBody();
		      b2Collision.CollidePolygons(this.m_manifold, (this.m_fixtureA.GetShape() instanceof b2PolygonShape ? this.m_fixtureA.GetShape() : null), bA.m_xf, (this.m_fixtureB.GetShape() instanceof b2PolygonShape ? this.m_fixtureB.GetShape() : null), bB.m_xf);
		   }
 		}).call(b2PolygonContact.prototype);
 		(function() {
 			this.Create = function() {
 				return new b2PolygonContact();
 			}
 			this.Destroy = function(contact, allocator) {

 			}

 		}).call(b2PolygonContact);
 		module.exports = b2PolygonContact;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/object/collision", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Collision = function() {

 		};
 		(function() {

 		}).call(Collision.prototype);
 		(function() {
 			this.create =function() {
 				return new Collision();
 			}
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

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

(function(define) {'use strict'
	define("latte_renderer/object/transform", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Transform = function(config) {
 			this.x = config.x || 0;
 			this.y = config.y || 0;
 			this.width = config.width || 0;
 			this.height = config.height || 0;
 			this.position = config.position || "relative";
 		};
 		(function() {
 			this.update = function(partnerTransform) {
 				if(!partnerTransform) { partnerTransform = Transform.defaultObject; }
 				var result = {};
 				switch(this.position) {
 					case "absolute":
 						result.x = this.x;
 						result.y = this.y;
 						result.width = this.width;
 						result.height = this.height;
 					break;
 					case "relative":
 					default:
 						result.x = partnerTransform.x + this.x;
		 				result.y = partnerTransform.y + this.y;
		 				result.width = this.width;
		 				result.height = this.height;
 					break;
 				}
 				return result;
 				//result.rotation = Transform.rotation(partnerTransform.rotation, this);

 			}
 			this.in = function(point, transform) {
 				if(transform.x < point.x && point.x < transform.x + transform.width 
 						&&  transform.y < point.y && point.y < transform.y + transform.height) {
 					return true;
 				}
 				return false;
 			}
 		}).call(Transform.prototype);
 		(function() {
 			this.defaultObject = {
 				x: 0,
 				y: 0,
 				width: 0,
 				height : 0
 			}
 		}).call(Transform);
 		(function() {
 			this.create = function(config) {
 				if(!config) {
 					config = {};
 				}
 				return new Transform(config);
 			}
 		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/renderer/2D/renderer2D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Renderer2D = function(element, type) {
 			this.context = element.getContext("2d");
 			this.width = element.width;
 			this.height = element.height;
 		};
 		(function() {
 			this.draw = function(commands) {
 				var self = this;
 				commands.forEach(function(command) {
 					self.drawOne(command);
 				});
 			}
 			this.drawOne = function(command) {
 				switch(command.type) {
 					case "image":
 						var image = command.image;
 						this.context.drawIamge(image.resources, image.x, image.y, image.width, image.height,
 								command.x, command.y, command.width || image.width, command.height || image.height);
 					break;
 					case "rectangle":
 						this.context.fillStyle = command.backgroundColor;
            			this.context.fillRect(command.x,command.y,command.width,command.height);
 					break;
 				}
 			}
 			this.clear = function() {
 				this.context.clearRect(0,0,this.width, this.height);
 			}
 		}).call(Renderer2D.prototype);

 		module.exports = Renderer2D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/renderer/3D/renderer3D", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var Renderer3D = function(element, type) {
 			this.context = element.getContext("2d");
 		};
 		(function() {
 			this.draw = function(commands) {
 				var self = this;
 				commands.forEach(function(command) {
 					self.drawOne(command);
 				});
 			}
 			this.drawOne = function(command) {
 				switch(command.type) {
 					case "image": 
 						this.context.fillStyle = command.fillStyle;
 						iamge = utils.getImage(command.image);

 						this.context.drawImage(image, command.x, command.y, command.height, command.width);
 					
 					break;
 				}
 			}
 			this.clear = function() {
 				
 			}
 		}).call(Renderer3D.prototype);

 		module.exports = Renderer3D;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/renderer/index", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			var self = this;
 			this.renderers = {
 				"2d": require("./2D/renderer2D"),
 				"3d": require("./3D/renderer3D")
 			}
 			this.create = function(element, type) {
 				return new self.renderers[type](element);
 			}
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/utils/hashMap", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		var latte_lib = require("latte_lib");
 		var HashMap = function() {
 			this.keys = {};
 			this.values = {};
 		};
 		(function() {
 			this.push = function(key, value) {
 				var keyCode = HashMap.getCode(key);
 				var valuesCode = HashMap.getCode(value);
 				this.keys[valuesCode] = key;
 				this.values[keyCode] = value;
 			}
 			this.get = function(key) {
 				var keyCode = HashMap.getCode(key);
 				return this.values[keyCode];
 			}
 			this.getKey = function(value) {
 				var keyCode = HashMap.getCode(key);
 				return this.values[keyCode];
 			}
 		}).call(HashMap.prototype);
 		(function() {
 			var code = 0;
 			this.getCode = function(key) {
 				if(latte_lib.isString(key)) {
 					return key;
 				}
 				if(key.code) {
 					return key.code;
 				}
 				key.code = code++;
 				return key.code;
 			}
 		}).call(HashMap);
 		module.exports = HashMap;
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_renderer/utils/lib", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
 		(function() {
 			this.isDom =  ( typeof HTMLElement === 'object' ) ?
            function(obj){
                return obj instanceof HTMLElement;
            } :
            function(obj){
                return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
            }
 		}).call(module.exports);
 	});
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });
