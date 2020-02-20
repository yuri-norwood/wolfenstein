"use strict";

/*
  ____                     _
 |  _ \ _ __ __ ___      _(_)_ __   __ _   _ __   __ _ _ __ ___   ___  ___ _ __   __ _  ___ ___
 | | | | '__/ _` \ \ /\ / / | '_ \ / _` | | '_ \ / _` | '_ ` _ \ / _ \/ __| '_ \ / _` |/ __/ _ \
 | |_| | | | (_| |\ V  V /| | | | | (_| | | | | | (_| | | | | | |  __/\__ \ |_) | (_| | (_|  __/
 |____/|_|  \__,_| \_/\_/ |_|_| |_|\__, | |_| |_|\__,_|_| |_| |_|\___||___/ .__/ \__,_|\___\___|
                                   |___/                                  |_|
*/
var Drawing = {}


/*
  ____                     _               ____  _          _    ____ _
 |  _ \ _ __ __ ___      _(_)_ __   __ _  |  _ \(_)_  _____| |  / ___| | __ _ ___ ___
 | | | | '__/ _` \ \ /\ / / | '_ \ / _` | | |_) | \ \/ / _ \ | | |   | |/ _` / __/ __|
 | |_| | | | (_| |\ V  V /| | | | | (_| |_|  __/| |>  <  __/ | | |___| | (_| \__ \__ \
 |____/|_|  \__,_| \_/\_/ |_|_| |_|\__, (_)_|   |_/_/\_\___|_|  \____|_|\__,_|___/___/
                                   |___/
*/
Drawing.Pixel = function (r, g, b) {
	// fields
	this.setRed(r);   // red component
	this.setGreen(g); // green component
	this.setBlue(b);  // blue component
}

Drawing.Pixel.prototype.getRed = function () { return this.red; }
Drawing.Pixel.prototype.setRed = function (red) {
	return 0 <= red && red <= 255
		? this.red = Math.round(red)
		: this.red = NaN;
}

Drawing.Pixel.prototype.getGreen = function () { return this.green; }
Drawing.Pixel.prototype.setGreen = function (green) {
	return 0 <= green && green <= 255
		? this.green = Math.round(green)
		: this.green = NaN;
}

Drawing.Pixel.prototype.getBlue = function () { return this.blue; }
Drawing.Pixel.prototype.setBlue = function (blue) {
	return 0 <= blue && blue <= 255
		? this.blue = Math.round(blue)
		: this.blue = NaN;
}

Drawing.Pixel.prototype.isPixelOn = function () {
	return (!isNaN(this.red))   &&
	       (!isNaN(this.green)) &&
	       (!isNaN(this.blue));
}

Drawing.Pixel.prototype.toHex = function () { return          this.toString("#RGB");          }
Drawing.Pixel.prototype.toCSS = function () { return "rgb(" + this.toString("r, g, b") + ")"; }
Drawing.Pixel.prototype.toString = function (format) {
	// format substitutes "r", "g", and "b" to decimal values of the
	// corresponding color value of the pixel, and substitutes "R", "G",
	// and "B" for the hexadecimal values of the corresponding color
	// values. The toHex() and toCSS() methods are wrappers for 

	return typeof format === "string" && format.length
		? format.replace(/r/, this.getRed())
		        .replace(/g/, this.getGreen())
		        .replace(/b/, this.getBlue())
		        .replace(/R/, ("0" + this.getRed().toString(16)).substr(-2))
		        .replace(/G/, ("0" + this.getGreen().toString(16)).substr(-2))
		        .replace(/B/, ("0" + this.getBlue().toString(16)).substr(-2))
		: this.isPixelOn()
			? "[object Drawing.Pixel (" + this.toHex() + ")]"
			: "[object Drawing.Pixel]";
}

Drawing.Pixel.CreateShaded = function (pixel, percent) { // static method to create a shaded pixel
	return new Drawing.Pixel(pixel.getRed()   * (100 + percent) / 100,
	                         pixel.getGreen() * (100 + percent) / 100,
	                         pixel.getBlue()  * (100 + percent) / 100);
}

Drawing.Pixel.Average = function (xs) { // static method to average a list of pixels
	if (Array.isArray(xs)) {
		var r = 0, g = 0, b = 0;

		try {
			for (var i = 0; i < xs.length; i++) {
				if (xs[i].isPixelOn && xs[i].isPixelOn()) { // valid pixel, calculate average
					r += xs[i].getRed();
					g += xs[i].getGreen();
					b += xs[i].getBlue();
				} else { // invalid pixel, cannot average
					throw "invalid pixel";
				}
			}

			r = r / xs.length;
			g = g / xs.length;
			b = b / xs.length;			
		} catch (err) {
			r = -1;
			g = -1;
			b = -1;
		}

		return new Drawing.Pixel(r, g, b);
	} else {
		return new Drawing.Pixel();
	}
}


/*
  ____                     _               ____                             ____ _
 |  _ \ _ __ __ ___      _(_)_ __   __ _  / ___|__ _ _ ____   ____ _ ___   / ___| | __ _ ___ ___
 | | | | '__/ _` \ \ /\ / / | '_ \ / _` || |   / _` | '_ \ \ / / _` / __| | |   | |/ _` / __/ __|
 | |_| | | | (_| |\ V  V /| | | | | (_| || |__| (_| | | | \ V / (_| \__ \ | |___| | (_| \__ \__ \
 |____/|_|  \__,_| \_/\_/ |_|_| |_|\__, (_)____\__,_|_| |_|\_/ \__,_|___/  \____|_|\__,_|___/___/
                                   |___/
*/
Drawing.Canvas = function (selector, scale) {
	// process
	var canvas = document.querySelector("" + selector);

	// validate
	if (!(canvas instanceof Element) || canvas.nodeName !== "CANVAS") {
		throw new TypeError("Drawing.Canvas(" + selector + ", " + scale + "): selector doesn't return valid Canvas Element");
	} else if (isNaN(scale) || scale < 1) {
		throw new TypeError("Drawing.Canvas(" + selector + ", " + scale + "): scale is not a valid scale");
	}

	// construct
	this._canvas  = canvas;
	this._context = canvas.getContext("2d")
	this._width   = canvas.width;
	this._height  = canvas.height;
	this._scale   = scale; // ratio of true pixels to drawn "pixels"
	this.space    = new Raytracing.Space(Math.round(canvas.width / scale),
	                                     Math.round(canvas.height / scale),
	                                     Math.round(canvas.height / scale));
}

Drawing.Canvas.prototype.getWidth  = function () { return this._width;  }
Drawing.Canvas.prototype.getHeight = function () { return this._height; }
Drawing.Canvas.prototype.getScale  = function () { return this._scale;  }

Drawing.Canvas.prototype.beginPath   = function () { this._context.beginPath(); }
Drawing.Canvas.prototype.rectangle   = function (x, y, w, h) { this._context.rect(x, y, w, h); }
Drawing.Canvas.prototype.fillStyle   = function (style) { this._context.fillStyle = style; }
Drawing.Canvas.prototype.strokeStyle = function (style) { this._context.strokeStyle = style; }
Drawing.Canvas.prototype.fill        = function () { this._context.fill(); }
Drawing.Canvas.prototype.stroke      = function () { this._context.stroke(); }

Drawing.Canvas.prototype.drawPixel = function (x, y, pixel) {
	this.beginPath();
	this.rectangle((x * this.getScale()),
	               (y * this.getScale()),
	               this.getScale(),
	               this.getScale());
	this.fillStyle(pixel.toCSS());
	this.strokeStyle(pixel.toCSS());
	this.fill();
	this.stroke();
}

Drawing.Canvas.prototype.drawFrame = function (frame) {
	for (var x = 0; x < this.getWidth() && x < frame.getWidth() ; x ++) {
		for (var y = 0; y < this.getHeight() && y < frame.getHeight(); y++) {
			this.drawPixel(x, y, frame.getPixelAt(x, y));
		}
	}
}

Drawing.Canvas.prototype.map = function () {
	return this.space.map(Math.round(canvas.getWidth()  / canvas.getScale()),
	                      Math.round(canvas.getHeight() / canvas.getScale()));
}

Drawing.Canvas.prototype.render = function () {
	return this.space.render(Math.round(canvas.getWidth()  / canvas.getScale()),
	                         Math.round(canvas.getHeight() / canvas.getScale()));
}

Drawing.Canvas.FramesPerSecond = 60;


/*
  ____                     _               _____                            ____ _
 |  _ \ _ __ __ ___      _(_)_ __   __ _  |  ___| __ __ _ _ __ ___   ___   / ___| | __ _ ___ ___
 | | | | '__/ _` \ \ /\ / / | '_ \ / _` | | |_ | '__/ _` | '_ ` _ \ / _ \ | |   | |/ _` / __/ __|
 | |_| | | | (_| |\ V  V /| | | | | (_| |_|  _|| | | (_| | | | | | |  __/ | |___| | (_| \__ \__ \
 |____/|_|  \__,_| \_/\_/ |_|_| |_|\__, (_)_|  |_|  \__,_|_| |_| |_|\___|  \____|_|\__,_|___/___/
                                   |___/
*/
Drawing.Frame = function (width, height, pixelGrid) {
	// validate
	if (isNaN(width) || width < 0) {
		throw new TypeError("Drawing.Frame(" + width + ", " + height + ", " + pixelGrid + "): width is not a valid width");
	} else if (isNaN(height) || height < 0) {
		throw new TypeError("Drawing.Frame(" + width + ", " + height + ", " + pixelGrid + "): height is not a valid height");
	} else if (!pixelGrid || pixelGrid.length !== width || !pixelGrid.every(pixelRow => pixelRow.length === height)) {
		throw new TypeError("Drawing.Frame(" + width + ", " + height + ", " + pixelGrid + "): pixelGrid doesn't contain pixels matching up to " + width + " by " + height);
	}

	// construct
	this._width  = width;
	this._height = height;
	this._grid   = pixelGrid;
}

Drawing.Frame.prototype.getWidth   = function () { return this._width;  }
Drawing.Frame.prototype.getHeight  = function () { return this._height; }
Drawing.Frame.prototype.getPixelAt = function (x, y) {
	try {
		return this._grid[x][y];
	} catch (e) {
		return new Drawing.Pixel();
	}
}


/*
 ____                     _               ____      _                  _____
|  _ \ _ __ __ ___      _(_)_ __   __ _  / ___|___ | | ___  _ __ ___  | ____|_ __  _   _ _ __ ___
| | | | '__/ _` \ \ /\ / / | '_ \ / _` || |   / _ \| |/ _ \| '__/ __| |  _| | '_ \| | | | '_ ` _ \
| |_| | | | (_| |\ V  V /| | | | | (_| || |__| (_) | | (_) | |  \__ \ | |___| | | | |_| | | | | | |
|____/|_|  \__,_| \_/\_/ |_|_| |_|\__, (_)____\___/|_|\___/|_|  |___/ |_____|_| |_|\__,_|_| |_| |_|
                                  |___/
*/
Drawing.Colors = { // 256 xterm colors from https://jonasjacek.github.io/colors
	Black   : new Drawing.Pixel(   0,   0,   0),
	Maroon  : new Drawing.Pixel( 128,   0,   0),
	Green   : new Drawing.Pixel(   0, 128,   0),
	Olive   : new Drawing.Pixel( 128, 128,   0),
	Navy    : new Drawing.Pixel(   0,   0, 128),
	Purple  : new Drawing.Pixel( 128,   0, 128),
	Teal    : new Drawing.Pixel(   0, 128, 128),
	Silver  : new Drawing.Pixel( 192, 192, 192),
	Grey    : new Drawing.Pixel( 128, 128, 128),
	Red     : new Drawing.Pixel( 255,   0,   0),
	Lime    : new Drawing.Pixel(   0, 255,   0),
	Yellow  : new Drawing.Pixel( 255, 255,   0),
	Blue    : new Drawing.Pixel(   0,   0, 255),
	Fuchsia : new Drawing.Pixel( 255,   0, 255),
	Aqua    : new Drawing.Pixel(   0, 255, 255),
	White   : new Drawing.Pixel( 255, 255, 255),
}
