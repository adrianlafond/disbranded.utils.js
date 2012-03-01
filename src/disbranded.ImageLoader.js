if (!disbranded) var disbranded = {};


/**
 * Loads images. For publi API, scroll down to the return {}, or
 * just search for 'Public API'.
 */
disbranded.ImageLoader = function(options) {
	var _imgsArr = [];
	var _imgsObj = {};
	var _uid = 0;
	var _loading = false;
	var _complete = false;
	var _completeNum = 0;
	var _length = 0;
	
	var _onStartCB = null;
	var _onChildCompleteCB = null;
	var _onCompleteCB = null;
	var _onProgressCB = null;
	var _onAbortCB = null;
	var _onErrorCB = null;
	var _onCancelCB = null;
	
	
	var _getUid = function() {
		return _uid++;
	};
	
	var _isArray = function(value) {
		return Object.prototype.toString.apply(value) === '[object Array]';
	};


	var _addImage = function(src, id, addFn) {
		//ensure src is a valid string
		if (src && typeof src === 'string') {
			
			//ensure id is unique; overwrite existing images with same id
			if (id && typeof id === 'string') {
				if (_imgsObj[id] !== undefined) {
					_removeImage(_imgsObj[id].src, id);
				}
			} else {
				id = '__auto_unique_id-' + _getUid();
			}

			//create and add new object
			_length += 1;			
			var obj = {
				img: new Image(),
				src: src,
				id: id,
				complete: false
			};
			_imgsArr[addFn](obj);
			_imgsObj[obj.id] = obj;
		}
	};
	
	
	var _removeImage = function(srcOrId) {
		var idPatt = /__auto_unique_id-/;
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (srcOrId === _imgsArr[i].id || (_imgsArr[i].src === srcOrId && idPatt.test(_imgsArr[i].id))) {
				_imgsArr[i].img.src = '';
				_imgsArr.splice(i, 1);
				delete _imgsObj[_imgsArr[i].id];
				_length -= 1;
				break;
			}
		}
	};
	
	
	var _add = function(src, id, addFn) {
		if (_isArray(src)) {
			for (var i = 0, len = src.length; i < len; i++) {
				_addImage(src[i].src, src[i].id, addFn);
			}
		} else {
			_addImage(src, id, addFn);
		}
	};
	
	var _remove = function(srcOrId) {
		if (_isArray(srcOrId)) {
			for (var i = 0, len = srcOrId.length; i < len; i++) {
				_removeImage(srcOrId[i]);
			}
		} else {
			_removeImage(srcOrId);
		}
	};
	
	
	var _onAbort = function(e) {
		_onImageComplete(this, 'abort');
	};
	
	var _onError = function() {
		_onImageComplete(this, 'error');
	};
	
	var _onLoad = function(e) {
		_onImageComplete(this, 'load');
	};
	
	var _onImageComplete = function(img, result) {
		//find object from img
		var obj;
		var index;
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (img === _imgsArr[i].img) {
				obj = _imgsArr[i];
				index = i;
				break;
			}
		}
		if (obj === undefined) {
			return;
		}
		
		//process result
		_completeNum += 1;
		switch (result) {
			case 'abort':
				if (_onAbort) {
					_onAbort(obj.id, index);
				}
				break;
			case 'error':
				if (_onErrorCB) {
					_onErrorCB(obj.id, index);
				}
				break;
			case 'load':
				obj.complete = true;
				if (_onProgressCB) {
					_onProgressCB(_completeNum, _length);
				}
				if (_onChildCompleteCB) {
					_onChildCompleteCB(img, obj.id, index);
				}
				break;
		}
		if (_completeNum === _length) {
			_loading = false;
			_complete = true;
			if (_onCompleteCB) {
				_onCompleteCB();
			}
		}
	}
	
	
	var _load = function(options) {
		options = (typeof options === 'object') ? options : {};
		if (_isArray(options.images)) {
			_add(options.images, null, 'push');
		}
		if (options.onStart) {
			_setCallback('start', options.onStart);
		}		
		if (options.onChildComplete) {
			_setCallback('childComplete', options.onChildComplete);
		}
		if (options.onComplete) {
			_setCallback('complete', options.onComplete);
		}
		if (options.onProgress) {
			_setCallback('progress', options.onProgress);
		}
		if (options.onAbort) {
			_setCallback('abort', options.onAbort);
		}
		if (options.onError) {
			_setCallback('error', options.onError);
		}
		if (options.onCancel) {
			_setCallback('cancel', options.onCancel);
		}
		
		if (_onStartCB) {
			_onStartCB();
		}

		_completeNum = 0;
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (_imgsArr[i].complete) {
				_completeNum += 1;
			} else {
				_imgsArr[i].img.onabort = _onAbort;
				_imgsArr[i].img.onerror = _onError;
				_imgsArr[i].img.onload = _onLoad;
				_imgsArr[i].img.src = _imgsArr[i].src;
			}
		}		
		_loading = _completeNum > 0;
		_complete = _completeNum == 0;
	};
	
	
	var _cancel = function() {
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (!_imgsArr[i].complete) {
				_imgsArr[i].img.src = '';
			}
		}
		if (_onCancelCB) {
			_onCancelCB();
		}
	};
	
	var _setCallback = function(type, fn) {
		if (typeof fn !== 'function' && fn !== null) {
			return;
		}
		switch (type) {
			case 'start':
				_onStartCB = fn;
				break;
			case 'childComplete':
				_onChildCompleteCB = fn;
				break;
			case 'complete':
				_onCompleteCB = fn;
				break;
			case 'progress':
				_onProgressCB = fn;
				break;
			case 'abort':
				_onAbortCB = fn;
				break;
			case 'error':
				_onErrorCB = fn;
				break;
			case 'cancel':
				_onCancelCB = fn;
				break;
			default:
				break;
		}
	};
	
	
	
	if (typeof options !== 'undefined' && _isArray(options.images)) {
		_load(options);
	}
	
	
	
	/**
	 * Public API
	 */
	return {
		/**
		 * Adds image(s) to the end of the images list (will load last).
		 * @param src can be either a single URL or an array of { url:[String]}[, id:[String] }
		 * @param id optional; is same as previous id, new image will overwrite old
		 */
		push: function(src, id) {
			_add(src, id, 'push');
			return this;
		},

		/**
		 * Alternate name for push()
		 */
		add: function(src, id) {
			return this.push(src, id);
		},
		
		/**
		 * Adds image(s) to the beginning of the images list (will load first).
		 * @param src can be either a single URL or an array of { url:[String]}[, id:[String] }
		 * @param id optional; is same as previous id, new image will overwrite old
		 */
		unshift: function(src, id) {
			_add(src, id, 'unshift');
			return this;
		},
		
		/**
		 * Removes an image from the images list if
		 * 1) @srcOrId matches image.src AND image.id was auto generated
		 * OR
		 * 2) @srcOrId matches image.id
		 * @param srcOrId can also be an array of @srcOrId values
		 */
		remove: function(srcOrId) {
			_remove(srcOrId);
			return this;
		},
		
		/**
		 * @returns length of images array
		 */
		length: function() {
			return _length;
		},
		
		/**
		 * @returns number of images that have completed loading
		 */
		completeLength: function() {
			return _completeNum;
		},
		
		/**
		 * @returns boolean whether ImageLoader is currently loading
		 */
		loading: function() {
			return _loading;
		},
		
		/**
		 * @returns boolean whether ImageLoader has finished loading
		 */
		complete: function() {
			return _complete;
		},
		
		/**
		 * Loads all images in the images array.
		 * @param options = {} with optional properties:
		 *		images: Array of objects in format { url:[String]}[, id:[String] }
		 *			that will be pushed onto images array.
		 *		onStart: callback function()
		 *		onChildComplete: callback function(Image, id, index)
		 *		onComplete: callback function()
		 *		onProgress: callback function(completeLength, length)
		 *		onAbort: callback function(id, index)
		 * 		onError: callback function(id, index)
		 *		onCancel: callback function()
		 */
		load: function(options) {
			_load(options);
			return this;
		},
		
		/**
		 * Cancels any loading currently in progress.
		 */
		cancel: function() {
			_cancel();
			return this;
		},
		
		/**
		 * @returns clone of object in images with @id 
		 */
		getImageById: function(id) {
			if (_imgsObj.hasOwnProperty(id)) {
				var obj = _imgsObj[id];
				return {
					img: obj.img,
					src: obj.src,
					id: obj.id,
					complete: obj.complete
				};
			}
			return null;
		},
		
		/**
		 * @returns clone of object in images with @index 
		 */
		getImageByIndex: function(index) {
			if (_imgsArr.hasOwnProperty(index)) {
				var obj = _imgsArr[index];
				return {
					img: obj.img,
					src: obj.src,
					id: obj.id,
					complete: obj.complete
				};
			}
			return null;
		},
		
		/**
		 * Set a callback function.
		 * @param {String} start, childComplete, complete, progress, abort, error, cancel
		 * @param callbackFn = the function to callback
		 * @see load()
		 */
		setCallback: function(eventType, callbackFn) {
			_setCallback(eventType, callbackFn);
			return this;
		}
	}
};


/**
 * Allows instaniating and loading images in one line:
 * var loader = disbranded.ImageLoader.load({ images:[images], onComplete:onCompleteFn });
 */
disbranded.ImageLoader.load = function(options) {
	return new disbranded.ImageLoader(options);
}