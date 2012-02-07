/**
* Depends on:
* disbranded.EventDispatcher.js
* disbranded.Timer.js
*/
disbranded.Tween = new Class({
	Extends: disbranded.EventDispatcher,

	initialize: function(options) {
		var _paused = true;
		var _reverse = false;
		var _started = false;
		var _startTime = NaN;
		var _prevTime = NaN;
		var _pauseTime = NaN;
		var _perc = 0;
		var _delay = new disbranded.Timer(0, 1);
		var _delayComplete = false;
		var _timer = new disbranded.Timer();
		var _options = {};
		var _values = {};
		var _self = this;
		
		this.pause = function() {
			if (!_paused) {
				_paused = true;
				_pauseTime = (new Date()).getTime();
				_delay.pause();
				_timer.pause();
			}
		};
		
		this.paused = function(value) {
			if (value == undefined) {
				return _paused;
			}
			if (value) {
				this.pause();
			} else {
				this.play();
			}
		};
		
		
		this.stop = function() {
			this.pause();
			_delayComplete = false;
			_reverse = false;
			_started = false;
			_startTime = NaN;
			_pauseTime = NaN;
			_prevTime = NaN;
			_perc = 0;
		};
		
		this.play = function() {
			if (_paused) {
				_paused = false;
				if (runDelay()) {
					runTimer();
				}
			}
		};
		
		this.reverse = function() {
			_reverse = true;
			this.play();
		};
		
		this.percent = function() {
			return _perc;
		};
		
		this.option = function(prop, val) {
			if (val == undefined) {
				return _options[prop];
			}
			_options[prop] = val;
			switch (prop) {
				case 'fps':
					_timer.delay(Math.max(12, Math.round(1000 / _options.fps)));
					break;
				case 'delay':
					_delay.delay(_options.delay);
					if (_options.delay <= 0) {
						_delayComplete = true;
					}
					break;
			}
			return this;
		};
		
		this.value = function(prop, valA, valB) {
			if (valA == undefined || valB == undefined) {
				return _values[prop].value;
			}
			_values[prop] = { a:valA, b:valB, value:valA };
			return this;
		};
		
		this.complete = function() {
			_timer.stop();
			_perc = _reverse ? 0 : 1;
			updateValues(_perc);
			_startTime = NaN;
			_dispatch(disbranded.Tween.UPDATE);
			_dispatch(disbranded.Tween.COMPLETE);
		}
		
		this.kill = function() {
			_delay.stop();
			_timer.stop();
		};
		
		
		
		
		function setOptions(options) {
			function setVal(prop, defaultVal) {
				_self.option(prop, options.hasOwnProperty(prop) ? options[prop] : defaultVal);
			}
			setVal('ease', disbranded.Tween.defaultEase);
			setVal('duration', 1000);
			setVal('delay', 0);
			setVal('time', 0);
			setVal('fps', 30);
			setVal('yoyo', false);
			setVal('onStart', null);
			setVal('onUpdate', null);
			setVal('onComplete', null);

			for (var prop in options) {
				switch (prop) {
					case 'ease':
					case 'duration':
					case 'delay':
					case 'time':
					case 'fps':
					case 'yoyo':
					case 'onStart':
					case 'onUpdate':
					case 'onComplete':
						break;				
					default:
						_self.value(prop, options[prop][0], options[prop][1]);
						break;
				}
			}
		}
		
		function runDelay() {
			if (_options.delay > 0 && !_delayComplete) {
				_delay.play();
				return false;
			}
			return true;
		}
		
		function onDelayComplete() {
			_delayComplete = true;
			runTimer();
		}
		
		function runTimer() {
			if (isNaN(_startTime)) {
				_startTime = _prevTime = (new Date()).getTime();
				_options.time = _reverse ? _options.duration : 0;
			} else if (_pauseTime != _startTime) {
				_options.time = _pauseTime - _startTime;
				_prevTime = (new Date()).valueOf();
				_startTime = _pauseTime = _prevTime - _options.time;
			}			
			_timer.play();
		}
		
		function update() {
			if (!_started) {
				_started = true;
				_dispatch(disbranded.Tween.START);
			}
			
			var now = (new Date()).getTime(); 
			var delta = now - _prevTime;
			_options.time += _reverse ? -delta : delta;
			_perc = _options.ease(_options.time, 0, 1, _options.duration);//_options.time / _options.duration;
			_prevTime = now;
			updateValues(_perc);
			_dispatch(disbranded.Tween.UPDATE);

			if ((!_reverse && _options.time >= _options.duration) || (_reverse && _options.time <= 0)) {
				if (!_reverse && _options.yoyo) {
					_self.reverse();
				} else {
					_self.complete();	
				}				
			}
		}
		

		function updateValues(perc) {
			//perc = Math.max(0, Math.min(1, perc));
			//console.log(perc);
			for (var prop in _values) {
				_values[prop].value = (_values[prop].b - _values[prop].a) * perc + _values[prop].a;
			}
		}
		
		
		function _dispatch(type) {
			switch (type) {
				case disbranded.Tween.START:
					if (_options.onStart) _options.onStart(_self);
					break;
				case disbranded.Tween.UPDATE:
					if (_options.onUpdate) _options.onUpdate(_self);
					break;
				case disbranded.Tween.COMPLETE:
					if (_options.onComplete) _options.onComplete(_self);
					break;
			}
			_self.dispatch(type);
		}
		
		
		setOptions(options);
		_delay.onTimerComplete = function() { onDelayComplete(); };
		_timer.onTimerTick = function() { update(); };
		this.play();
	}
});
disbranded.Tween.START = 'start';
disbranded.Tween.UPDATE = 'update';
disbranded.Tween.COMPLETE = 'complete';

disbranded.Tween.defaultEase = function(t, b, c, d) {
	return -c * (t /= d) * (t - 2) + b;
};
