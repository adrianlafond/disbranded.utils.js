if (typeof disbranded === "undefined") var disbranded = {};

/******************************************************************************
Color converts virtually any number or CSS-compliant color string to a raw RGB
number, which it can then convert to any other CSS-compliant string.
eg, input a RGB and output a HSL.
Also has static methods such as a interpolateColor which can be useful in 
transitions.

public methods:
	constructor(color, alpha)
		calls setColor(color, alpha)
	setColor(color, alpha)
		@color can be either raw number (eg, 0x888888) or any CSS-compliant
		string (eg, #fff, rgb(128, 128, 128), hsl(120, 50%, 50%), red)
		@alpha = number between 0 and 1; if @color is set to rgba or hsla,
		then @alpha is ignored in favor of the rgba or hsla alpha value.
		By default, @color = 0 and @alpha = 1.
		If this.setColor('rgb(128, 128, 128, 0.5)') is followed by
		this.setColor('#FF0000'), alpha remains 0.5.
	getColor()
		returns the raw rgb value (eg, 0x888888) set in setColor()
	getHex()
		returns string: #888888
	getRGB(withAlpha)
		returns string: rgb(128, 128, 128)
		if (withAlpha), returns string: rgba(128, 128, 128, 0.5)
	getRGBA()
		returns getRGB(true)
	getRGBPercent(withAlpha)
		return string: rgb(50%, 50%, 50%)
		if (withAlpha), returns string rgba(50%, 50%, 50%, 0.5);
	getRGBAPercent()
		return getRGBPercent(true)
	getHSL(withAlpha)
		returns string: hsl(100, 50%, 50%)
		if (withAlpha), returns string: hsla(100, 50%, 50%, 0.5)
	getHSLA()
		returns getHSL(true)
	getHue()
		returns the H in HSL as number between 0 - 1 (a percent of 360)
	getSaturation()
		returns the S in HSL as number between 0 - 1
	getLight()
		returns the L in HSL as number between 0 - 1
	getAlpha()
		returns alpha, a number between 0 and 1
	setAlpha(n) 
		sets alpha to @n, setting min to 0 and max to 1
	getGreen()
		returns green channel, an integer between 0 and 255
	getRed()
		returns red channel, an integer between 0 and 255
	getBlue()
		returns blue channel, an integer between 0 and 255
	setBrightness(n)
		return toBrightness(color, n)

static methods:
	toHex(color)
		@color = rgb number
		static, returns @color as hex string: #ffffff
	toRGB(color, [alpha])
		@color = rgb number
		@alpha = number between 0 and 1
		static, returns @color as rgb string: rgb(128, 128, 128)
		if alpha is defined, returns rgba(128, 128, 128, 0.5)
	toRGBPercent(color, [alpha])
		@color = rgb number
		@alpha = number between 0 and 1
		static, returns @color as rgb percents: rgb(50%, 50%, 50%)
		if alpha is defined, returns rgba(50%, 50%, 50%, 0.5)
	toHSL(color, [alpha])
		@color = rgb number
		@alpha = number between 0 and 1
		static, returns @color as hsl: hsl(120, 50%, 50%)
		if alpha is defined, returns hsla(120, 50%, 50%, 0.5)
	getHSLNums(color)
		@color = rgb number
		returns object with raw HSL numbers: { hue:n, saturation:n, light:n }
	interpolateColor(from, to, perc)
		@from, @to = colors
		@perc = percent between 0 and 1
		static, returns a color from @from to @to blended to @perc
	interpolateChannel(from, to, perc)
		@from, @to = channels in rgb
		@perc = percent between 0 and 1
		static, returns a channel from @from to @to blended to @perc
	getOpaqueEquiv(color, alpha, matte)
		static, returns the opqaque equivalent to setting a color/opacity in modern browsers.
		eg, for rgb(0, 0, 0, 0.2) over a white background (black at 20% alpha over white)
		call toHex(getOpaqueEquiv('black', 0.2, 'white')) white returns #cccccc
	toBrightness(color, n)
		static, sets brightness of @color by @n
		@n = number between 0 (100% black) and 2 (100% white)
		if @n == 1, has no effect
		
	round(n)
		static, utility function
		rounds n to closest disbranded.Color.decimals
		
* properties:
	decimals
		static, the number of decimals points for RGB and HSL percents
	
@see http://en.wikipedia.org/wiki/Web_colors
******************************************************************************/
disbranded.Color = function(color, alpha) {
	var _color = 0;
	var _alpha = 1.0;
	
	this.setColor = function(color, alpha) {
		if (typeof color === "string") {
			
			//check if color is a name in a color table:
			color = disbranded.Color.html[color.toLowerCase()] || color;
			color = disbranded.Color.x11[color.toLowerCase()] || color;
			
			var hex, rgb, rgba, hsl, hsla, model;
			hex = color.match(/^\s*#?([0-9abcdef]+)\s*$/i);
			model = hex != null; 
			if (!model) {
				rgb = color.match(/\s*rgb\(\s*(.*)\s*,\s*(.*)\s*,\s*(.*)\s*\)\s*/i);
				model = rgb != null; 
			}
			if (!model) {
				rgba = color.match(/\s*rgba\(\s*(.*)\s*,\s*(.*)\s*,\s*(.*)\s*,\s*(.*)\s*\)\s*/i);
				model = rgba != null;
			}
			if (!model) {
				hsl = color.match(/\s*hsl\(\s*(.*)\s*,\s*(.*)%\s*,\s*(.*)%\s*\)\s*/i);
				model = hsl != null;
			}
			if (!model) {
				hsla = color.match(/\s*hsla\(\s*(.*)\s*,\s*(.*)%\s*,\s*(.*)%\s*,\s*(.*)\s*\)\s*/i);
				model = hsla != null;
			}
			
			var i, c, m, arr;
			
			// #FFFFFF to RGB
			if (hex) {
				if (hex[1].length == 3) {
					c = hex[1].split("");
					hex[1] = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
				}
				_color = parseInt("0x" + hex[1]);
				_alpha = (alpha && !isNaN(parseFloat(alpha))) ? parseFloat(alpha) : _alpha;

			// rgb(r,g,b) to RGB
			} else if (rgb || rgba) {
				arr = rgb || rgba;
				for (i = 1; i <= 3; i++) {
					m = arr[i].match(/^([0-9]+|(?:[0-9]*\.[0-9]+))(%*)$/i);
					if (m == null) {
						arr[i] = 0;
					} else {
						arr[i] = parseFloat(m[1]);
						if (m[2] && m[2] == "%") {
							arr[i] = arr[i] / 100 * 255;
						}
					}
					arr[i] = Math.max(0, Math.min(255, parseInt(arr[i])));
				}
				_color = arr[1] << 16 | arr[2] << 8 | arr[3];
			
			// hsl(180, 50%, 50%) to RGB	
			} else if (hsl || hsla) {
				arr = hsl || hsla;
				var H = Math.round(arr[1]) / 360;
				var S = parseFloat(arr[2]) / 100;
				var L = parseFloat(arr[3]) / 100;
				var r,g,b;

				if (S == 0) {
					r = g = b = Math.max(0, Math.min(255, Math.round(L * 255)));
				} else {
					var v2 = (L < 0.5) ? (L * (1 + S)) : ((L + S) - (S * L));
					var v1 = 2 * L - v2;
					r = 255 * hueToRGB(v1, v2, H + 1/3);
					g = 255 * hueToRGB(v1, v2, H);
					b = 255 * hueToRGB(v1, v2, H - 1/3);
				}
				
				_color = r << 16 | g << 8 | b;

			} else {
				_color = 0;
			}
			
		} else if (typeof color === "number") {
			_color = color;
		} else {
			_color = 0;
		}

		_color = Math.max(0, Math.min(0xFFFFFF, parseInt(_color)));
		
		if (rgba || hsla) {
			m = (rgba || hsla)[4].match(/[0-9]*\.[0-9]+/i);
			_alpha = (m != null) ? parseFloat((rgba || hsla)[4]) : 0;
		}
		_alpha = Math.max(0, Math.min(1, _alpha));
	}
	
	//private function, used in converting RGB to HSL
	function hueToRGB(va, vb, vH) {
		if (vH < 0) vH += 1;
		if (vH > 1) vH -= 1;
		if ((6 * vH) < 1) return va + (vb - va) * 6 * vH;
		if ((2 * vH) < 1) return vb;
		if ((3 * vH) < 2) return va + (vb - va) * (2/3 - vH) * 6;
		return va;
	}
	
	this.getColor = function() {
		return _color;
	}
	
	this.getAlpha = function() {
		return _alpha;
	}
	
	this.setAlpha = function(n) {
		_alpha = Math.max(0, Math.min(1, n));
	}
	
	
	this.getHex = function() {
		return disbranded.Color.toHex(_color);
	}
	
	this.getRGB = function(withAlpha) {
		return disbranded.Color.toRGB(_color, withAlpha ? _alpha : undefined);
	}
	
	this.getRGBA = function() {
		return this.getRGB(_color, _alpha);
	}
	
	this.getRGBPercent = function(withAlpha) {
		return disbranded.Color.toRGBPercent(_color, withAlpha ? _alpha : undefined);
	}
	
	this.getRGBAPercent = function() {
		return this.getRGBPercent(_color, _alpha);
	}
	
	this.getHSL = function(withAlpha) {
		return disbranded.Color.toHSL(_color, withAlpha ? _alpha : undefined);
	}
	
	this.getHSLA = function() {
		return this.getHSL(_color, _alpha);
	}
	
	this.getHue = function() {
		return disbranded.Color.getHSLNums(_color).hue;
	}
	
	this.getSaturation = function() {
		return disbranded.Color.getHSLNums(_color).saturation;
	}
	
	this.getLight = function() {
		return disbranded.Color.getHSLNums(_color).light;
	}
	
	this.getRed = function() {
		return (_color >> 16) & 0xFF;
	}

	this.getGreen = function() {
		return (_color >> 8) & 0xFF;
	}

	this.getBlue = function() {
		return _color & 0xFF;
	}
	
	this.setBrightness = function(n) {
		_color = disbranded.Color.toBrightness(_color, n);
	}
	
	this.setColor(color);
};


disbranded.Color.toHex = function(color) {
	var c = (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	var str = c.toString(16);
	while(str.length < 6) {
		str = "0" + str;
	}
	return "#" + str;
}

disbranded.Color.toRGB = function(color, alpha) {
	var c = (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	var str = (alpha == undefined) ? 'rgb(' : 'rgba(';
	str += ((color >> 16) & 0xFF) +', '+ ((c >> 8) & 0xFF) +', '+ (c & 0xFF);
	str += (alpha == undefined) ? ')' : (', ' + alpha + ')');
	return str;
}

disbranded.Color.toRGBPercent = function(color, alpha) {
	var c = (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	var str = (alpha == undefined) ? 'rgb(' : 'rgba(';
	str += disbranded.Color.round(((c >> 16) & 0xFF) / 0xFF * 100)  +'%, '+ disbranded.Color.round(((c >> 8) & 0xFF) / 0xFF * 100) +'%, '+ disbranded.Color.round((c & 0xFF) / 0xFF * 100) +'%';
	str += (alpha == undefined) ? ')' : (', ' + disbranded.Color.round(alpha) + ')');
	return str;
}


disbranded.Color.toHSL = function(color, alpha) {
	var c = (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	var nums = disbranded.Color.getHSLNums(c);
	var H = Math.round(nums.hue * 360);
	var S = disbranded.Color.round(nums.saturation * 100);
	var L = disbranded.Color.round(nums.light * 100);
	if (alpha == undefined) {
		return 'hsl('+ H +', '+ S +'%, '+ L +'%)';
	}
	return 'hsla('+ H +', '+ S +'%, '+ L +'%,'+alpha+')'
}

disbranded.Color.getHSLNums = function(color) {
	var c = (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	var r = ((c >> 16) & 0xFF) / 255;
	var g = ((c >>  8) & 0xFF) / 255;
	var b = ( c        & 0xFF) / 255;
	
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var dMax = max - min;
	
	var H = 0;
	var S = 0;
	var L = (max + min) / 2;

	if (dMax != 0) {
		S = (L < 0.5) ? (dMax / (max + min)) : (dMax / (2 - max - min));
		var dR = (((max - r) / 6 ) + (dMax / 2)) / dMax;
		var dG = (((max - g) / 6 ) + (dMax / 2)) / dMax;
		var dB = (((max - b) / 6 ) + (dMax / 2)) / dMax;
		
		if (r == max) {
			H = dB - dG;
		} else if (g == max) {
			H = 1/3 + dR - dB;
		} else {
			H = 2/3 + dG - dR;
		}
		
		if (H < 0) H += 1;
		if (H > 1) H -= 1;		
	}
	return { hue:H, saturation:S, light:L };
}


disbranded.Color.decimals = 3;
disbranded.Color.round = function(n) {
	var d = Math.max(0, Math.min(10, Math.round(disbranded.Color.decimals)));
	if (d == 0) return Math.round(n);
	var e = Math.pow(10, d);
	return Math.round(n * e) / e;
}

disbranded.Color.interpolateColor = function(from, to, perc) {
	var f = (typeof from === "string") ? (new disbranded.Color(from).getColor()) : from;
	var t = (typeof to === "string") ? (new disbranded.Color(to).getColor()) : to;
	var r = disbranded.Color.interpolateChannel((f >> 16) & 0xFF, (t >> 16) & 0xFF, perc);
	var g = disbranded.Color.interpolateChannel((f >>  8) & 0xFF, (t >>  8) & 0xFF, perc);
	var b = disbranded.Color.interpolateChannel( f        & 0xFF,  t        & 0xFF, perc);
	return r << 16 | g << 8 | b;
};

disbranded.Color.interpolateChannel = function(from, to, perc) {
	return Math.round(from * (1 - perc) + to * perc);
}

disbranded.Color.toBrightness = function(color, n) {
	n = Math.max(0, Math.min(2, n));
	if (n == 1) {
		return (typeof color === "string") ? (new disbranded.Color(color).getColor()) : color;
	} else if (n < 1) {
		return disbranded.Color.interpolateColor(0x000000, color, n);
	} else if (n > 1) {
		return disbranded.Color.interpolateColor(color, 0xFFFFFF, n - 1);
	}
}

disbranded.Color.getOpaqueEquiv = function(color, alpha, matte) {
	alpha = (alpha==undefined) ? 1 : alpha;
	matte = (matte==undefined) ? 0xFFFFFF : matte;
	return disbranded.Color.interpolateColor(matte, color, alpha);
}


/* http://en.wikipedia.org/wiki/Web_colors#X11_color_names */
disbranded.Color.x11 = {
	//red
	indianred: 				'#cd5c5c',
	lightcoral: 			'#f09090',
	salmon: 				'#fa8072',
	darksalmon: 			'#e9967a',
	lightsalmon: 			'#ffa07a',
	crimson: 				'#dc143c',
	red: 					'#ff0000',
	firebrick: 				'#b22222',
	darkred: 				'#8b0000',
	
	//pink
	pink: 					'#ffc0cb',
	lightpink: 				'#ffb6c1',
	hotpink: 				'#ff69b4',
	deeppink: 				'#ff1493',
	mediumvioletred: 		'#c71585',
	palevioletred: 			'#db7093',
	
	//orange
	lightsalmon: 			'#ffa07a',
	coral: 					'#ff7f50',
	tomato: 				'#ff6347',
	orangered: 				'#ff4500',
	darkorange: 			'#ff8c00',
	orange: 				'#ffa500',
	
	//yellow
	gold: 					'#ffd700',
	yellow: 				'#ffff00',
	lightyellow: 			'#ffff00',
	lemonchiffon: 			'#fffacd',
	lightgoldenrodyellow:  	'#fafad2',
	papayawhip: 			'#ffefd5',
	moccasin: 				'#ffe4b5',
	peachpuff: 				'#ffdab9',
	palegoldenrod: 			'#eee8aa',
	khaki: 					'#f0e68c',
	darkkhaki: 				'#bdb76b',
	
	//purple
	lavender: 				'#e6e6fa',
	thistle: 				'#d8bfd8',
	plum: 					'#dda0dd',
	violet: 				'#ee82ee',
	orchid: 				'#da70d6',
	fuchsia: 				'#ff00ff',
	magenta: 				'#ff00ff',
	mediumorchid: 			'#ba55d3',
	mediumpurple: 			'#9370db',
	amethyst: 				'#9966cc',
	blueviolet: 			'#8a2be2',
	darkviolet: 			'#9400d3',
	darkorchid: 			'#9932cc',
	darkmagenta: 			'#8b008b',
	purple: 				'#800080',
	indigo: 				'#4b0082',
	slateblue: 				'#6a5acd',
	darkslateblue: 			'#483d8b',
	mediumslateblue: 		'#7b68ee',
	
	//green
	greenyellow: 			'#adff2f',
	chartreuse: 			'#7fff00',
	lawngreen: 				'#7cfc00',
	lime: 					'#00ff00',
	limegreen: 				'#32cd32',
	palegreen: 				'#98fb98',
	lightgreen: 			'#90ee90',
	mediumspringgreen: 		'#00fa9a',
	springgreen: 			'#00ff7f',
	mediumseagreen: 		'#3cb371',
	seagreen: 				'#2e8b57',
	forestgreen: 			'#228b22',
	green: 					'#008000',
	darkgreen: 				'#006400',
	yellowgreen: 			'#9acd32',
	olivedrab: 				'#6b8e23',
	olive: 					'#808000',
	darkolivegreen: 		'#556b2f',
	mediumaquamarine: 		'#66cdaa',
	darkseagreen: 			'#8fbc8f',
	lightseagreen: 			'#20b2aa',
	darkcyan: 				'#008b8b',
	teal: 					'#008080',
	
	//blue
	aqua: 					'#00ffff',
	cyan: 					'#00ffff',
	lightcyan: 				'#e0ffff',
	paleturquoise: 			'#afeeee',
	aquamarine: 			'#7fffd4',
	turquoise: 				'#40e0d0',
	mediumturquoise: 		'#48d1cc',
	darkturquoise: 			'#00ced1',
	cadetblue: 				'#5f9ea0',
	steelblue: 				'#4682b4',
	lightsteelblue: 		'#b0c4de',
	powderblue: 			'#b0e0e6',
	lightblue: 				'#add8e6',
	skyblue: 				'#87ceeb',
	lightskyblue: 			'#87cefa',
	deepskyblue: 			'#00bfff',
	dodgerblue: 			'#1e90ff',
	cornflowerblue: 		'#6495ed',
	mediumslateblue: 		'#7b68ee',
	royalblue: 				'#4169e1',
	blue: 					'#0000ff',
	mediumblue: 			'#0000cd',
	darkblue: 				'#00008b',
	navy: 					'#000080',
	midnightblue: 			'#191970',
	
	//brown
	cornsilk: 				'#fff8dc',
	blanchedalmond: 		'#ffebcd',
	bisque: 				'#ffe4c4',
	navajowhite: 			'#ffdead',
	wheat: 					'#f5deb3',
	burlywood: 				'#d3b887',
	tan: 					'#d2b48c',
	rosebrown: 				'#bc8f8f',
	sandybrown: 			'#f4a460',
	goldenrod: 				'#daa520',
	darkgoldenrod: 			'#b8860b',
	peru: 					'#cd853f',
	chocolate: 				'#d2691e',
	saddlebrown: 			'#8b4513',
	sienna: 				'#a0522d',
	brown: 					'#a52a2a',
	maroon: 				'#800000',
	
	//white
	white: 					'#ffffff',
	snow: 					'#fffafa',
	honeydew: 				'#f0fff0',
	mintcream: 				'#f5fffa',
	azure: 					'#f0ffff',
	aliceblue: 				'#f0f8ff',
	ghostwhite: 			'#f8f8ff',
	whitesmoke: 			'#f5f5f5',
	seashell: 				'#fff5ee',
	beige: 					'#f5f5dc',
	oldlace: 				'#fdf5e6',
	floralwhite: 			'#fffaf0',
	ivory: 					'#fffff0',
	antiquewhite: 			'#faebd7',
	linen: 					'#faf0e6',
	lavenderblush: 			'#fff0f5',
	mistyrose: 				'#ffe4e1',
	
	//gray
	gainsboro: 				'#dcdcdc',
	lightgrey: 				'#d3d3d3',
	lightgray: 				'#d3d3d3',
	silver: 				'#c0c0c0',
	darkgray: 				'#a9a9a9',
	gray: 					'#808080',
	dimgray: 				'#696969',
	lightslategray: 		'#778899',
	slategray: 				'#708090',
	darkslategray: 			'#2f4f4f',
	black: 					'#000000'
};


/* HTML color names; @see http://en.wikipedia.org/wiki/HTML_color_names
  'orange' added with CSS 2.1: http://en.wikipedia.org/wiki/Web_colors#CSS_colors
  There colors are a subset of disbranded.Color.x11 but are included here
  for reference.*/
disbranded.Color.html = {
	white: 		'#ffffff',
	silver: 	'#c0c0c0',
	gray: 		'#808080',
	black: 		'#000000',
	red: 		'#ff0000',
	maroon: 	'#800000',
	yellow: 	'#ffff00',
	olive: 		'#808000',
	lime: 		'#00ff00',
	green: 		'#008000',
	aqua: 		'#00ffff',
	teal: 		'#008080',
	blue: 		'#0000ff',
	navy: 		'#000080',
	fuchsia: 	'#ff00ff',
	purple: 	'#800080',
	orange: 	'#ffa500'
};