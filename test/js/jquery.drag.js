/**
 * $(obj).drag([options]);
 * 
 *
 * optional params:
 * lockCenter : default false (drag from mouse offset or exact center of object)
 * container : default null (unlimited drag area); object with x, y, width, height values that contain the drag area
 * onStartDrag : function(event)
 * onDragStart : function(event)
 * onStopDrag : function(event)
 *
 * event properties:
 * target : object being dragged
 * offset : object with global left and top of target
 * pageX  : global mouse x
 * pageY  : global mouse y
 * localX : mouse x relative to target
 * localY : mouse y relative to target
 * touch  : boolean; whether device is touch or not, based on events fired
 *
 * If options==false, deactivates dragging. eg, $('#id').drag(false);
 *
 * returns obj
 *
 * @author Adrian Lafond
 */
(function($) {
	var defaults = {
		container: 'none',
		lockCenter: false
    };

	var obj, objDom, touch, mouseOffsetX, mouseOffsetY;
	
    $.fn.drag = function(options) {
		//DESTROY
		if (options != undefined && !options) {
			return this.each(function(i) {
	            $(this).unbind("mousedown.drag", onMouseDownHandler);
				$(document).unbind('mousemove.drag', onMouseMoveHandler);
				$(document).unbind('mouseup.drag', onMouseUpHandler);
				try {
					this.removeEventListener("touchstart", onMouseDownHandler);
					document.removeEventListener('touchmove', onMouseMoveHandler);
					document.removeEventListener('touchend', onMouseUpHandler);
					document.removeEventListener('touchcancel', onMouseUpHandler);
				} catch (e) {}
	        });
		}
	
		return this.each(function() {
			obj = $(this);
			options = (options && typeof options === "object") ? options : {};
			var c = getContainer(options.container);
			//trace(obj.attr('id'), c.x, c.y, c.width, c.height);
			options.lockCenter = (typeof options.lockCenter === "boolean") ? options.lockCenter : false;
			options.onStartDrag = (typeof options.onStartDrag === "function") ? options.onStartDrag : null;
			options.onDragStart = (typeof options.onDragStart === "function") ? options.onDragStart : null;
			options.onStopDrag = (typeof options.onStopDrag === "function") ? options.onStopDrag : null;
			obj.data('dragOptions', options);
			
			var offset = getOffset(obj);
			positionObj(offset.left, offset.top, c);
			$(this).bind("mousedown.drag", onMouseDownHandler);
			try {
				this.addEventListener("touchstart", onMouseDownHandler);
			} catch (e) {}
        });
	};

	function onMouseDownHandler(evt) {
		obj = $(this);
		objDom = this;
		objDom.blur();
		evt.preventDefault();
		
		var options = obj.data('dragOptions');
		var c = getContainer(options.container);
		var evtObj = getEventObject(evt);
		mouseOffsetX = options.lockCenter ? (obj.width() / 2) : evtObj.localX;
		mouseOffsetY = options.lockCenter ? (obj.height() / 2) : evtObj.localY;

		//use the event type to determine if we have a touch device or not
		touch = evt.type.toLowerCase() == "touchstart";
		if (touch) {
			document.addEventListener('touchmove', onMouseMoveHandler);
			document.addEventListener('touchend', onMouseUpHandler);
			document.addEventListener('touchcancel', onMouseUpHandler);
		} else {
			$(document).bind('mousemove.drag', onMouseMoveHandler);
			$(document).bind('mouseup.drag', onMouseUpHandler);
		}
		if (options.onStartDrag) {
			options.onStartDrag(evtObj);
		}
		evt.preventDefault();
	}


	function onMouseMoveHandler(evt) {
		evt.preventDefault();
		var evtObj = getEventObject(evt);
		var options = obj.data('dragOptions');
		positionObj(evtObj.pageX - mouseOffsetX, evtObj.pageY - mouseOffsetY, getContainer(options.container));
		if (options.onDragUpdate) {
			options.onDragUpdate(evtObj);
		}
	}

	function onMouseUpHandler(evt) {
		evt.preventDefault();
		var evtObj = getEventObject(evt);
		if (touch) {
			document.removeEventListener('touchmove', onMouseMoveHandler);
			document.removeEventListener('touchend', onMouseUpHandler);
			document.removeEventListener('touchcancel', onMouseUpHandler);
			objDom.addEventListener('touchstart', onMouseDownHandler);
		} else {
			$(document).unbind('mousemove.drag', onMouseMoveHandler);
			$(document).unbind('mouseup.drag', onMouseUpHandler);
		}
		var options = obj.data('dragOptions');
		if (options.onStopDrag) {
			options.onStopDrag(evtObj);
		}
	}

	function positionObj(x, y, container) {
		var c = container;
		var p = getOffset(obj.offsetParent());//.offset();
		//trace(c.x, c.y, c.width, c.height, " :: ", x, y)
		if (isNaN(c.x) || isNaN(c.width)) {
			obj.css('left', x);
		} else {
			x -= p.left;
			obj.css('left', Math.max(c.x, Math.min(c.x + c.width, x)));
		}
		if (isNaN(c.y) || isNaN(c.height)) {
			obj.css('top', y);
		} else {
			y -= p.top;
			obj.css('top', Math.max(c.y, Math.min(c.y + c.height, y)));
		}
	}

	function getContainer(setting) {
		setting = setting || "none";
		if (typeof setting === "object") {
			return {
				x: (!setting.hasOwnProperty("x") || isNaN(setting.x)) ? 0 : setting.x,
				y: (!setting.hasOwnProperty("y") || isNaN(setting.y)) ? 0 : setting.y,
				width: (!setting.hasOwnProperty("width") || isNaN(setting.width)) ? 0 : setting.width,
				height: (!setting.hasOwnProperty("height") || isNaN(setting.height)) ? 0 : setting.height
			};
		}
		return { x:NaN, y:NaN, width:NaN, height:NaN };
	}


	//because offset() causes an error in Safari !?!
	function getOffset(obj) {
		obj = (obj instanceof jQuery) ? obj.get(0) : obj;
		var x = 0;
		var y = 0;
		while (obj.offsetParent) {
			x += obj.offsetLeft;
			y += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return { left:x, top:y };
	}

	function getPageX(evt) {
		return evt.changedTouches ? evt.changedTouches[0].pageX : evt.pageX;
	}

	function getPageY(evt) {
		return evt.changedTouches ? evt.changedTouches[0].pageY : evt.pageY;
	}

	function getEventObject(evt) {
		var evtObj = {};
		evtObj.target = obj;
		evtObj.offset = getOffset(obj);//.offset();
		evtObj.pageX = getPageX(evt);
		evtObj.pageY = getPageY(evt);
		evtObj.localX = evtObj.pageX - evtObj.offset.left;
		evtObj.localY = evtObj.pageY - evtObj.offset.top;
		evtObj.touch = touch;
		return evtObj;
	}


})(jQuery);
