if (typeof disbranded === "undefined") var disbranded = {};


disbranded.degreesToRadians = function(degrees) {
	return degrees * Math.PI / 180;
};
disbranded.d2r = disbranded.degreesToRadians;

disbranded.radiansToDegrees = function(radians) {
	return radians / 180 * Math.PI;
};
disbranded.r2d = disbranded.radiansToDegrees;


/**
* Based on AS3 flash.geom.Point
*/
disbranded.Point = new Class({
	
	_x: 0,
	_y: 0,
	
	initialize: function(x, y) {
		this.x((typeof x === "number") ? x : this.x());
		this.y((typeof y === "number") ? y : this.y());
	},
	
	x: function(value) {
		if (value == undefined) {
			return this._x;
		}
		this._x = value;
		return this;
	},
	
	y: function(value) {
		if (value == undefined) {
			return this._y;
		}
		this._y = value;
		return this;
	},

	
	/*
	* Distance from (0,0)
	*/
	length: function() {
		return Math.sqrt(x * x + y * y);
	},
	
	clone: function() {
		return new disbranded.Point(this.x(), this.y());
	},
	
	add: function(pt) {
		return new disbranded.Point(
			this.x() + pt.x(),
			this.y() + pt.y()
		);
	},
	
	subtract: function(pt) {
		return new disbranded.Point(
			this.x() - pt.x(),
			this.y() - pt.y()
		);
	},
	
	equals: function(pt) {
		return this.x() == pt.x() && this.y() == pt.y();
	},
	
	offset: function(dx, dy) {
		this._x += dx;
		this._y += dy;
	},
	
	normalize: function(thickness) {
		var p = thickness / this.length();
		this._x *= p;
		this._y *= p;
	},
	
	toString: function() {
		return '(x='+ this.x() +', y='+ this.y() +')';
	}
	
});

/*
* @returns distance between pt1 and pt2
*/
disbranded.Point.distance = function(pt1, pt2) {
	return Math.sqrt((pt1.x() - pt2.x()) * (pt1.x() - pt2.x()) + (pt1.y() - pt2.y()) * (pt1.y() - pt2.y()));
};

/*
* Determines a point between two specified points.
* @param f = number between 0 and 1
*/
disbranded.Point.interpolate = function(pt1, pt2, f) {
	f = Math.min(1, Math.max(0, f));
	if (f == 1) return pt1;
	if (f == 0) return pt2;
	var maxX = Math.max(pt1.x(), pt2.x());
	var minX = Math.min(pt1.x(), pt2.x());
	var maxY = Math.max(pt1.y(), pt2.y());
	var minY = Math.min(pt1.y(), pt2.y());
	return new disbranded.Point(
		minX + (maxX - minX) * f,
		minY + (maxY - minY) * f
	);
};

/*
* Converts a pair of polar coordinates to a Cartesian point coordinate.
*/
disbranded.Point.polar = function(len, angle) {
	return new disbranded.Point(
		Math.cos(angle) * len,
		Math.sin(angle) * len
	);
};



/*
* Based on AS3 flash.geom.Rectangle
*/
disbranded.Rectangle = new Class({
	_x: 0,
	_y: 0,
	_width: 0,
	_height: 0,
	
	initialize: function(x, y, width, height) {
		this.x((typeof x === "number") ? x : this.x());
		this.y((typeof y === "number") ? y : this.y());
		this.width((typeof width === "number") ? width : this.width());
		this.height((typeof height === "number") ? height : this.height());
	},
	
	x: function(value) {
		if (value == undefined) {
			return this._x;
		}
		this._x = value;
		return this;
	},
	
	y: function(value) {
		if (value == undefined) {
			return this._y;
		}
		this._y = value;
		return this;
	},
	
	width: function(value) {
		if (value == undefined) {
			return this._width;
		}
		this._width = value;
		return this;
	},
	
	height: function(value) {
		if (value == undefined) {
			return this._height;
		}
		this._height = value;
		return this;
	},
	
	clone: function() {
		return new disbranded.Rectangle(this.x(), this.y(), this.width(), this.height());
	},
	setEmpty: function() {
		this.width(0).height(0);
	},
	isEmpty: function() {
		return this.width() <= 0 || this.height() <= 0;
	},
	
	offset: function(dx, dy) {
		this._x += dx;
		this._y += dy;
	},
	offsetPoint: function(pt) {
		offset(pt.x(), pt.y());
	},
	
	getSize: function() {
		return new disbranded.Point(this.width(), this.height());
	},	
	getTop: function() {
		return Math.min(this.y(), this.y() + this.height());
	},
	getRight: function() {
		return Math.max(this.x(), this.x() + this.width());
	},
	getBottom: function() {
		return Math.max(this.y(), this.y() + this.height());
	},
	getLeft: function() {
		return Math.min(this.x(), this.x() + this.width());
	},
	getTopLeft: function() {
		return new disbranded.Point(this.getLeft(), this.getTop());
	},
	getBottomRight: function() {
		return new disbranded.Point(this.getRight(), this.getBottom());
	},
	
	contains: function(x, y) {
		return x >= this.getLeft() && x <= this.getRight() && y >= this.getTop() && y <= this.getBottom();
	},	
	containsPoint: function(pt) {
		return this.contains(pt.x(), pt.y());
	},
	containsRect: function(rect) {
		return rect.getLeft() >= this.getLeft() && rect.getRight() <= this.getRight()
				&& rect.getTop() >= this.getTop() && rect.getBottom() <= this.getBottom();
	},
	intersects: function(rect) {
		return rect.getLeft() <= this.getRight() && rect.getRight() >= this.getLeft()
				&& rect.getTop() <= this.getBottom() && rect.getBottom() >= this.getTop();
	},
	intersection: function(rect) {
		if (this.intersects(rect)) {
			var x = Math.max(rect.getLeft(), this.getLeft());
			var y = Math.max(rect.getTop(), this.getTop());
			return new disbranded.Rectangle(x, y,
								Math.min(rect.getRight(), this.getRight()) - x,
								Math.min(rect.getBottom(), this.getBottom()) - y);
		}
		return new disbranded.Rectangle();
	},
	union: function(rect) {
		return new disbranded.Rectangle(Math.min(rect.getLeft(), this.getLeft()),
								Math.min(rect.getTop(), this.getTop()),
								Math.max(rect.getRight(), this.getRight()),
								Math.min(rect.getBottom(), this.getBottom()));
	},
	equals: function(rect) {
		return rect.x() == this.x() && rect.y() == this.y() && rect.width() == this.width() && rect.height() == this.height();
	},
	
	toString: function() {
		return '(x='+ this.x() +' y='+ this.y() +' w='+ this.width() +' h='+ this.height() +')';
	}
});

