if (typeof disbranded === "undefined") var disbranded = {};


disbranded.EventDispatcher = new Class({

	listeners: null,
	target: null,
	
	/**
	* If instantiating a standalone EventDispatcher instance
	* (instead of extending or implementing it), it might be useful
	* to set a default target property for event objects.
	*
	* If EventDispatcher is extended/implemented, this is discouraged.
	*/
	initialize: function(target) {
		this.target = target || null;
	},

	/**
	* @param type = string, name of the event (eg, 'change', 'open', etc)
	* @param listener = function that will be called on #dispatch()
	*/
	addListener: function(type, listener) {
		if (this.listeners == null) {
			this.listeners = {};
		}
		if (!this.listeners[type]) {
			this.listeners[type] = [];
		}

		for (var i = 0, len = this.listeners[type].length; i < len; i++) {
			if (listener.hasOwnProperty('__listenerId') && this.listeners[type][i].__listenerId == listener.__listenerId) {
				return this;
			}
		}
		
		if (!listener.hasOwnProperty('__listenerId')) {
			listener.__listenerId = this.getUniqueId();
		}
		this.listeners[type].push(listener);
		return this;
	},
	
	/**
	* @see #addListener()
	*/
	removeListener: function(type, listener) {
		if (this.listeners == null) {
			this.listeners = {};
		}
		if (!this.listeners[type]) return this;
		for (var i = 0, len = this.listeners[type].length; i < len; i++) {
			if (listener.hasOwnProperty('__listenerId') && this.listeners[type][i].__listenerId == listener.__listenerId) {
				this.listeners[type].splice(i, 1);
				return this;
			}
		}
		return this;
	},
	
	/**
	* @param type (string) = event type
	* @param data (object) = optional
	* @param cannotStopPropagation (boolean) = default false; if true, event.stopPropagation() fails
	* @param cannotPreventDefault (boolean) = default false; if true, event.preventDefault() fails
	*
	* Will use keyword this as default evt.target, but that can be overwritten.
	* @returns true if event dispatched successfully; false if unsuccessful or if
	*   event.preventDefault() was called.
	*
	* Listener functions can call on the event:
	*   event.stopPropagation() - prevents further dispatch of the event
	*   event.preventDefault() - toggles a flag that can be checked via:
	*   event.isDefaultPrevented() - returns true if event.preventDefault() has been called.
	* If a listener function returns false, it is the equivalent of calling both
	* event.stopPropagation() and event.preventDefault().
	*
	* Example:
	*     //this.openPanel() will not be called if event.preventDefault() was called,
	*     //since in that case this.dispatch() would return false:
	*     if (this.dispatch('open', { element:'panel' })) {
	*          this.openPanel();
	*     }
	*/
	dispatch: function(type, data, cannotStopPropagation, cannotPreventDefault) {
		var evt = new disbranded.Event(type, cannotStopPropagation, cannotPreventDefault);
		evt.target = this.target || this;
		if (data != null && typeof data === "object") {
			for (var key in data) {
				if (evt.hasOwnProperty(key) && !(key == 'type' || key == 'target')) {
					continue;
				}
				evt[key] = data[key];
			}
		}
		return this.dispatchEvent(evt);
	},	
	
	/*
	* @param evt = disbranded.Event
	*/
	dispatchEvent: function(evt) {
		if (this.hasListener(evt.type)) {
			if (evt.target == null) {
				evt.target = this.target || this;
			}	
			for (var i = 0, len = this.listeners[evt.type].length; i < len; i++) {
				if (!evt.isStopped()) {
					if (this.listeners[evt.type][i](evt) == false) {
						evt.stopPropagation();
						evt.preventDefault();
					}
				}
			}
			return !evt.isDefaultPrevented();
		}
		return true;
	},

	
	/**
	* @returns true if a listener for @param type exists.
	*/
	hasListener: function(type) {
		if (this.listeners == null) {
			this.listeners = {};
		}
		return this.listeners[type] != undefined && this.listeners[type].length > 0;
	},
	
	getUniqueId: (function() {
		var id = 0;
		return function() {
			return id++;
		}
	})()	
});


/*
* Can be extended and used in conjunction with disbranded.EventDispatcher.dispatchEvent()
*/
disbranded.Event = new Class({
	initialize: function(type, cannotStopPropagation, cannotPreventDefault) {
		this.type = type;
		this.target = null;
		var _stopped = false;
		var _prevented = false;
		var _cannotStopPropagation = (cannotStopPropagation != undefined && cannotStopPropagation == true);
		var _cannotPreventDefault = (cannotPreventDefault != undefined && cannotPreventDefault == true);		

		this.stopPropagation = function() {
			if (!_cannotStopPropagation) {
				_stopped = true;
			}
		};
		
		this.isStopped = function() {
			return _stopped;
		};
		
		this.preventDefault = function() {
			if (!_cannotPreventDefault) {
				_prevented = true;
			}
		};
		
		this.isDefaultPrevented = function() {
			return _prevented;
		};
	}
});