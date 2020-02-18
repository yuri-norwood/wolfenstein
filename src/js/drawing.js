"use strict";

/*
Drawing namespace
*/
var Drawing = {}


/*
Drawing.Pixel Class
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

	return typeof format === "string" && format.length && this.isPixelOn()
		? format.replace(/r/, this.getRed())
		        .replace(/g/, this.getGreen())
		        .replace(/b/, this.getBlue())
		        .replace(/R/, ("0" + this.getRed().toString(16)).substr(-2))
		        .replace(/G/, ("0" + this.getGreen().toString(16)).substr(-2))
		        .replace(/B/, ("0" + this.getBlue().toString(16)).substr(-2))
		: "[object Drawing.Pixel]";
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


function draw_frame(ctxt, frame, x_unit, y_unit) {
	for (var i = 0; i < frame.length; i++) {
		ctxt.beginPath();
		ctxt.rect(
			(i % 100) * x_unit,
			Math.floor(i / 100) * y_unit,
			x_unit,
			y_unit
		);
		ctxt.fillStyle = frame[i].toCSS();
		ctxt.fill();
		ctxt.stroke();
	}
}


var space;

$(window).on("load", function () {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var x_unit = canvas.width / 100;
	var y_unit = canvas.height / 100;
	var framesPerSec = 2;
	var randomSurface = function () {
		return [
			new Drawing.Pixel(
				Math.random() * 255,
				Math.random() * 255,
				Math.random() * 255
			)
		];
	}

	space = new Raytracing.Space(100, 100, 100);

	// draw the space border
	for (var x = 0; x < space.getWidth(); x++) {
		for (var y = 0; y < space.getLength(); y++) {
			if (y === 0 || y === space.getLength() - 1 || x === 0 || x == space.getWidth() - 1) {
				space.drawPoint(x, y, randomSurface());
			}
	 	}
	}

	// draw some rectangles
	space.drawRectangle(5, 25, 9, 72, randomSurface());
	space.drawRectangle(15, 75, 19, 92, randomSurface());
	space.drawRectangle(25, 15, 29, 48, randomSurface());
	space.drawRectangle(95, 5, 36, 43, randomSurface());
	space.drawRectangle(95, 75, 56, 93, randomSurface());

	// draw some circles
	space.drawCircle(30, 70, 10, randomSurface());

	setInterval(function () {
		var grid = space.map();
		var frame = [];

		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				frame.push(grid[x][y]);
			}
		}

		draw_frame(context, frame, x_unit, y_unit);
	}, 1000 / framesPerSec);
});
