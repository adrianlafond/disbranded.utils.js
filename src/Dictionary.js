/**
 * Allows use of virtually anything as a key:
 * numbers, strings, objects, functions, even boolean
 * For key comparisons, makes use of an internal unique id.
 */
var Dictionary = function() {
	var _idName = '__dictionaryId';
	var _objs = {};
	var _len = 0;
	
	this.set = function(key, value) {
		var obj = _getObj(key);
		if (obj) {
			obj.v = value;
			return;
		} else {
			switch (typeof key) {
				case 'number':
				case 'string':
				case 'boolean':
					obj = { id:_uid(), k:key, v:value };
					break;
				case 'object':
				case 'function':
					obj = { id:_uid(), k:key, v:value };
					key[_idName] = obj.id;					
					break;
				case null:
				case 'undefined':
				default:
					return;
			}
		}
		++_len;
		_objs[obj.id] = obj;
	};

	this.get = function(key) {
		var obj = _getObj(key);
		return obj ? obj.v : null;
	};

	this.remove = function(key) {
		var obj = _getObj(key);
		if (obj) {
			--_len;
			delete _objs[obj.id];
		}
	};

	this.has = function(key) {
		return _getObj(key) != null;
	};

	this.length = function(value) {
		if (value == 0) {
			for (var k in _objs) {
				--_len;
				delete _objs[k];
			}
			return;
		}
		return _len;
	};

	this.forEach = function(fn) {
		for (var k in _objs) {
			fn(_objs[k].k, _objs[k].v);
		}
	};
	
	function _getObj(key) {
		switch (typeof key) {
			case 'number':
			case 'string':
			case 'boolean':
				for (var k in _objs) {
					if (_objs[k].k === key) {
						return _objs[k];
					}					 
				}
				break;
			case 'object':
			case 'function':
				return _objs[key[_idName]] || null;
		}
		return null;
	}
	
	var _uid = (function() {
		var id = 0;
		return function() {
			return id++;
		}
	})();
};