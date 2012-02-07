
disbranded.Timer = new Class({
	Extends: disbranded.EventDispatcher,
	
	/**
	* @param delay = number, in milliseconds
	* @param repeatTicks = number, how many times to repeat; 0 = infinite
	*/
	initialize: function(delay, repeatTicks) {
		this.parent();
		var _paused = true;
		var _ticks = 0;
		var _timeout = null;
		var _delay = 0;
		var _repeatTicks = 0;
		
		this.paused = function(value) {
			if (value == undefined) {
				return _paused;
			}
			if (value) {
				pause();
			} else {
				play();
			}
		};
		
		this.ticks = function() {
			return _ticks;
		};
		
		this.delay = function(value) {
			if (value == undefined) {
				return _delay;
			}
			_delay = Math.round(Math.max(12, value));
			return this;
		};
		
		this.repeatTicks = function(value) {
			if (value == undefined) {
				return _repeatTicks;
			}
			_repeatTicks = Math.round(Math.max(0, repeatTicks || 0));
			return this;
		}
		
		this.fps = function(value) {
			if (value == undefined) {
				return Math.round(1000 / _delay);
			}
			_delay = Math.max(12, Math.round(1000 / value));
			return this;
		};
		
		this.pause = function() {
			if (!_paused) {
				_paused = true;
				clearTimeout(_timeout);
			}
		};
		
		this.stop = this.reset = function() {
			this.pause();
			_ticks = 0;
		};
		
		this.play = function() {
			if (_paused) {
				_paused = false;
				var self = this;
				_timeout = setTimeout(function() {
					_ticks++;
					
					if (typeof self.onTimerTick === 'function') {
						self.onTimerTick(self);
					}
					self.dispatch(disbranded.Timer.TIMER_TICK, { ticks:_ticks });
					
					if (!_paused && (_repeatTicks == 0 || _ticks < _repeatTicks)) {
						_paused = true;
						self.play();
					} else {
						var ticks = _ticks;
						self.stop();
						if (typeof self.onTimerComplete === 'function') {
							self.onTimerComplete(self);
						}
						self.dispatch(disbranded.Timer.TIMER_COMPLETE, { ticks:_ticks });
					}
				}, _delay);
			}
		};
		
		this.delay(delay);
		this.repeatTicks(repeatTicks);
		this.onTimerTick = this.onTimerComplete = null;
	}
	
});
disbranded.Timer.TIMER_TICK = 'timer_tick';
disbranded.Timer.TIMER_COMPLETE = 'timer_complete';
