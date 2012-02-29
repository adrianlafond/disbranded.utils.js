if (!disbranded) var disbranded = {};

disbranded.ImageLoader = function() {
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
				id = 'img-' + _getUid();
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
	
	
	var _removeImage = function(src, id) {
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (_imgsArr[i].src === src && _imgsArr[i].id === id) {
				_imgsArr[i].img.src = '';
				_imgsArr.splice(i, 1);
				delete _imgsObj[id];
				_length -= 1;
				break;
			}
		}
	};
	
	
	var _add = function(src, id, addFn) {
		if (_isArray(src)) {
			for (var i = 0, len = src.length; i < len; i++) {
				_addImage(array[i].src, array[i].id, addFn);
			}
		} else {
			_addImage(src, id, addFn);
		}
	};
	
	var _remove = function(src, id) {
		if (_isArray(src)) {
			for (var i = 0, len = src.length; i < len; i++) {
				_removeImage(array[i].src, array[i].id);
			}
		} else {
			_removeImage(src, id);
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
		
		_loading = false;
		_complete = true;
		_completeNum = 0;
		for (var i = 0, len = _imgsArr.length; i < len; i++) {
			if (_imgsArr[i].complete) {
				_completeNum += 1;
			} else {
				_loading = true;
				_complete = false;
				_imgsArr[i].img.onabort = _onAbort;
				_imgsArr[i].img.onerror = _onError;
				_imgsArr[i].img.onload = _onLoad;
				_imgsArr[i].img.src = _imgsArr[i].src;
			}
		}
	};
	
	
	var _cancel = function() {
		for (var i = 0, len = _imgArr.length; i < len; i++) {
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
	
	
	
	// Public API
	return {
		push: function(src, id) {
			_add(src, id, 'push');
		},
		
		unshift: function(src, id) {
			_add(src, id, 'unshift');
		},
		
		remove: function(src, id) {
			_remove(src, id);
		},
		
		length: function() {
			return _length;
		},
		
		completeLength: function() {
			return _completeNum;
		},
		
		loading: function() {
			return _loading;
		},
		
		complete: function() {
			return _complete;
		},
		
		load: function(options) {
			_load(options);
		},
		
		cancel: function() {
			_cancel();
		},
		
		getImageById: function(id) {
			return _imgsObj[id] || null;
		},
		
		getImageByIndex: function(index) {
			return _imgsArr[index] || null;
		},
		
		setCallback: function(eventType, callbackFn) {
			_setCallback(eventType, callbackFn);
		}
	}
};