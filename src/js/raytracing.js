"use strict";

/*
  ____             _                  _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _   _ __   __ _ _ __ ___   ___  ___ _ __   __ _  ___ ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | | '_ \ / _` | '_ ` _ \ / _ \/ __| '_ \ / _` |/ __/ _ \
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| | | | | | (_| | | | | | |  __/\__ \ |_) | (_| | (_|  __/
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, | |_| |_|\__,_|_| |_| |_|\___||___/ .__/ \__,_|\___\___|
             |___/                            |___/                                  |_|
*/
var Raytracing = {}


/*
  ____             _                  _               ____                                             _                   _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  / ___| _ __   __ _  ___ ___    ___ ___  _ __  ___| |_ _ __ _   _  ___| |_ ___  _ __
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | \___ \| '_ \ / _` |/ __/ _ \  / __/ _ \| '_ \/ __| __| '__| | | |/ __| __/ _ \| '__|
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_ ___) | |_) | (_| | (_|  __/ | (_| (_) | | | \__ \ |_| |  | |_| | (__| || (_) | |
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)____/| .__/ \__,_|\___\___|  \___\___/|_| |_|___/\__|_|   \__,_|\___|\__\___/|_|
             |___/                            |___/        |_|
*/
Raytracing.Space = function (width, length, height) {
	// validation
	if (isNaN(width)) {
		throw new TypeError("Raytracing.Space: width passed as " + width);
	}
	if (isNaN(length)) {
		throw new TypeError("Raytracing.Space: length passed as " + length);
	}
	if (isNaN(height)) {
		throw new TypeError("Raytracing.Space: height passed as " + height);
	}

	// fields
	this.setWidth(width);
	this.setLength(length);
	this.setHeight(height);
	this.viewPoint = new Raytracing.ViewPoint(this,
	                                          Math.floor(this._width / 2),
	                                          Math.floor(this._length / 2),
	                                          0);
	this._grid = []; // create the internal abstraction
	for (var x = 0; x < width; x++) {
		var col = []; // column to add
		for (var y = 0; y < length; y++) {
			var row = []; // row to add
			for (var z = 0; z < height; z++) {
				row.push(new Raytracing.Pixel());
			}
			col.push(row);
		}
		this._grid.push(col);
	}
},


/*
  ____             _                  _           __     ___               ____       _       _                         _                   _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ \ \   / (_) _____      _|  _ \ ___ (_)_ __ | |_    ___ ___  _ __  ___| |_ _ __ _   _  ___| |_ ___  _ __
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` \ \ / /| |/ _ \ \ /\ / / |_) / _ \| | '_ \| __|  / __/ _ \| '_ \/ __| __| '__| | | |/ __| __/ _ \| '__|
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |\ V / | |  __/\ V  V /|  __/ (_) | | | | | |_  | (_| (_) | | | \__ \ |_| |  | |_| | (__| || (_) | |
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_/  |_|\___| \_/\_/ |_|   \___/|_|_| |_|\__|  \___\___/|_| |_|___/\__|_|   \__,_|\___|\__\___/|_|
             |___/                            |___/
*/
Raytracing.ViewPoint = function (space, x, y, rotation) {
	// validation
	if (!space instanceof Raytracing.Space) {
		throw new TypeError("Raytracing.ViewPoint(): " + space + "is not a Raytracing.Space");
	}
	if (isNaN(x)) {
		throw new TypeError("Raytracing.ViewPoint(): " + x + " is not a number");
	}
	if (isNaN(y)) {
		throw new TypeError("Raytracing.ViewPoint(): " + y + " is not a number");
	}
	if (isNaN(rotation)) {
		throw new TypeError("Raytracing.ViewPoint(): " + rotation + " is not a number");
	}

	// fields
	this._space = space;        // the space this point occupies
	this.setXPos(x);            // x position of point
	this.setYPos(y);            // y position of point
	this.setRotation(rotation); // rotation of point
},


/*
  ____             _                  _               ____  _          _                       _                   _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  |  _ \(_)_  _____| |   ___ ___  _ __  ___| |_ _ __ _   _  ___| |_ ___  _ __
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | | |_) | \ \/ / _ \ |  / __/ _ \| '_ \/ __| __| '__| | | |/ __| __/ _ \| '__|
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_|  __/| |>  <  __/ | | (_| (_) | | | \__ \ |_| |  | |_| | (__| || (_) | |
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_|   |_/_/\_\___|_|  \___\___/|_| |_|___/\__|_|   \__,_|\___|\__\___/|_|
             |___/                            |___/
*/
Raytracing.Pixel = function (r, g, b) {
	// fields
	this.setRed(r);   // red component
	this.setGreen(g); // green component
	this.setBlue(b);  // blue component
}


/*
  ____             _                  _               ____                                         _        _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  / ___| _ __   __ _  ___ ___   _ __  _ __ ___ | |_ ___ | |_ _   _ _ __   ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | \___ \| '_ \ / _` |/ __/ _ \ | '_ \| '__/ _ \| __/ _ \| __| | | | '_ \ / _ \
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_ ___) | |_) | (_| | (_|  __/ | |_) | | | (_) | || (_) | |_| |_| | |_) |  __/
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)____/| .__/ \__,_|\___\___| | .__/|_|  \___/ \__\___/ \__|\__, | .__/ \___|
             |___/                            |___/        |_|                    |_|                           |___/|_|
*/
Raytracing.Space.prototype.getWidth = function ()      { return this._width;  }
Raytracing.Space.prototype.setWidth = function (width) { this._width = width; }

Raytracing.Space.prototype.getLength = function ()       { return this._length;   }
Raytracing.Space.prototype.setLength = function (length) { this._length = length; }

Raytracing.Space.prototype.getHeight = function ()       { return this._height;   }
Raytracing.Space.prototype.setHeight = function (height) { this._height = height; }

Raytracing.Space.prototype.getPixelsAt = function (x, y) { return this._grid[x][y] ? this._grid[x][y] : []; }
Raytracing.Space.prototype.arePixelsOn = function (x, y) { return this.getPixelsAt(x, y).length > 0 && this.getPixelsAt(x, y).every(pixel => pixel.isPixelOn()); }

Raytracing.Space.prototype.drawPoint     = function (x, y, pixels)           {
	// validate the pixels
	if (pixels.length <= 0 || !pixels.every(pixel => pixel instanceof Raytracing.Pixel && pixel.isPixelOn())
	) {
		throw new TypeError("Raytracing.Space.drawPoint(): not all pixels in (" + pixels + ") are valid Raytracing.Pixel instances");
	}

	// pad the pixels to ensure there are enough
	var i = 0;
	while (pixels.length < this.getHeight()) {
		pixels.push(pixels[i++]);
	}

	// populate the point
	for (var z = 0; z < this.getHeight(); z++) {
		this._grid[x][y][z] = pixels[z];
	}
}
Raytracing.Space.prototype.drawLine      = function (x1, y1, x2, y2, pixels) { throw "TODO" }
Raytracing.Space.prototype.drawRectangle = function (x1, y1, x2, y2, pixels) {
	for (var x = x1; x !== x2; x1 <= x2 ? x++ : x--) {
		for (var y = y1; y !== y2; y1 <= y2 ? y++ : y--) {
			if (x === x1 ||
			    x === x2 + (x1 <= x2 ? -1 : +1) ||
			    y === y1 ||
			    y === y2 + (y1 <= y2 ? -1 : +1)
			) {
				this.drawPoint(x, y, pixels);
			}
		}
	}
}
Raytracing.Space.prototype.drawCircle    = function (x, y, r, pixels)        {
	var r = Math.abs(r);
	var tolerance = 0.5;

	for (var i = x - r; i <= x + r; i++) {
		for (var j = y - r; j <= y + r; j++) {
			if (i <  0                ||
			    i >= this.getWidth()  ||
			    j <  0                ||
			    j >= this.getLength()
			) {
				// out of the space bounds, skip this coordinate
				continue;
			}

			if (
			    (Raytracing.Math.distance(x, y, i, j) - tolerance) > r ||
			    (Raytracing.Math.distance(x, y, i, j) + tolerance) < r
			) {
				// not on the  circumference, skip this coordinate
				continue;
			}

			this.drawPoint(i, j, pixels);
		}
	}
}

Raytracing.Space.prototype.map = function () {
	var map = [];

	for (var x = 0; x < this.getWidth(); x++) {
		map.push("\n");
		for (var y = 0; y < this.getLength(); y++) {
			map[x] = map[x] + (this.viewPoint.getXPos() == x &&
			                   this.viewPoint.getYPos() == y
			                   ? 0 <= this.viewPoint.getRotation()   &&
			                     this.viewPoint.getRotation() < 90
			                     ? "^"
			                     : 90 <= this.viewPoint.getRotation()  &&
			                       this.viewPoint.getRotation() < 180
			                       ? ">"
			                       : 180 <= this.viewPoint.getRotation() &&
			                         this.viewPoint.getRotation() < 270
			                         ? "v"
			                         : 270 <= this.viewPoint.getRotation() &&
			                           this.viewPoint.getRotation() < 360
			                           ? "<"
			                           : "@"
			                   : this.arePixelsOn(x, y)
			                   	? "."
			                   	: " ");
		}
	}

	return map.join("");
}

Raytracing.Space.prototype.render = function (width, height, blurDistance) {
	// returns a w by h grid of pixels to draw
	var screen = [];

	// calculate the angle in degrees of each horizontal pixel
	var anglePerPixel = Raytracing.ViewPoint.FieldOfView / width;
	var startingAngle = this.viewPoint.getRotation() - Raytracing.ViewPoint.FieldOfView / 2;

	// perspectiveRatio dictates how small things in the distance are
	var perspectiveRatio = 0.75;

	for (var x = 0; x < width; x++) {
		screen.push([]); // add a pixel column to the screen

		// scan all currently visible pixels
		var scanLine = this.viewPoint.scan(startingAngle + (anglePerPixel * x));

		// these are the pixels for the current angle
		var pixels = scanLine.pixels;
		
		// the distance from the view point these pixels
		var distance = scanLine.distance;

		// calculate which pixels to keep
		var pixelsToUse = [];
		if (distance < blurDistance) {
			var numberOfPixels = pixels.length * perspectiveRatio;
			var compressionRatio = Math.floor(pixels.length / numberOfPixels);
			for (var i = 0; i < numberOfPixels; i++) {
				var newPixels = [];
				for (var j = 0; j < compressionRatio; j++) {
					newPixels.push(pixels.pop());
				}
				pixelsToUse.push(Raytracing.Pixel.Average(newPixels));
			}
		}

		// add empty pixels to screen column until pixels are centered
		for (var topPadding = 0; topPadding < Math.floor((height - pixelsToUse.length) / 2); topPadding++) {
			screen[x].push(new Raytracing.Pixel());
		}

		// add pixes the screen column
		for (var pixelToUse = 0; pixelToUse < pixelsToUse.length; pixelToUse++) {
			screen[x].push(pixelsToUse[pixelToUse]);
		}

		// add empty pixels to screen column until column full
		while (screen[x].length < height) {
			screen[x].push(new Raytracing.Pixel());
		}
	}

	return screen;
}


/*
  ____             _                  _           __     ___               ____       _       _                     _        _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ \ \   / (_) _____      _|  _ \ ___ (_)_ __ | |_   _ __  _ __ ___ | |_ ___ | |_ _   _ _ __   ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` \ \ / /| |/ _ \ \ /\ / / |_) / _ \| | '_ \| __| | '_ \| '__/ _ \| __/ _ \| __| | | | '_ \ / _ \
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |\ V / | |  __/\ V  V /|  __/ (_) | | | | | |_  | |_) | | | (_) | || (_) | |_| |_| | |_) |  __/
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_/  |_|\___| \_/\_/ |_|   \___/|_|_| |_|\__| | .__/|_|  \___/ \__\___/ \__|\__, | .__/ \___|
             |___/                            |___/                                                |_|                           |___/|_|
*/
Raytracing.ViewPoint.prototype.getXPos = function () { return this._x; }
Raytracing.ViewPoint.prototype.setXPos = function (x) {
	return 0 <= x && x <= this._space.getWidth()
		? this._x = x
		: this._x = x >= 0
			? this._space.getWidth()
			: 0;
}

Raytracing.ViewPoint.prototype.getYPos = function () { return this._y; }
Raytracing.ViewPoint.prototype.setYPos = function (y) {
	return 0 <= y && y <= this._space.getLength()
		? this._y = y
		: this._y = y >= 0
			? this._space.getLength()
			: 0;
}

Raytracing.ViewPoint.prototype.getRotation = function () { return this._rotation; }
Raytracing.ViewPoint.prototype.setRotation = function (rotation) {
	if (0 <= rotation && rotation <= 359) {
		this._rotation = rotation;
	} else if (rotation > 0) {
		this._rotation = rotation % 360;
	} else {
		while (rotation < 0) {
			rotation += 360;
		}
		this._rotation = rotation;
	}
}

Raytracing.ViewPoint.prototype.scan = function (angle) { // returns pixels and distance at angle
	// calculate the ratio of x to y
	var slope = Raytracing.Math.degreesToIncline(angle);

	// ensure coordinates won't escape available space
	slope = Raytracing.Math.roundToMax(
		Raytracing.Math.roundToMin(
			slope,
			-Math.floor(this._space.getLength() / 2)),
		Math.floor(this._space.getLength() / 2));

	// get the angle in degrees and account for over/underflow
	var oldAngle = this.getRotation(); // remember orientation
	this.setRotation(angle); // setter contains modulo logic
	var theta = this.getRotation(); // (angle in range 0 - 360)
	this.setRotation(oldAngle); // return to previous orientation

	// determine directionality
	var scanInNegativeXDirection = theta >= 90 && theta < 270;
	var scanInNegativeYDirection = theta >=  0 && theta < 180;

	// start counting the distance
	var xDistance = 0;
	var yDistance = 0;
	var stopScanning = false;

	while (!stopScanning &&
	       0 <= xDistance &&
	       xDistance <= this._space.getWidth()
	) {
		while (!stopScanning &&
		       0 <= yDistance &&
		       yDistance <= this._space.getLength() &&
		       scanInNegativeYDirection
		       	? (xDistance * slope) <= yDistance
		       	: yDistance <= (xDistance * slope)
		) {
			var pixels = this._space.getPixelsAt(xDistance, yDistance);

			// stop looking if all pixels at the (x,y) cords are on
			stopScanning = pixels.length > 0 && pixels.every(function (pixel) {
				return pixel.isPixelOn();
			});

			// break out early if scan line hit something
			if (stopScanning) {
				break;
			}

			// move to next y position
			scanInNegativeYDirection
				? yDistance--
				: yDistance++;
		}

		// break out early if scan line hit something
		if (stopScanning) {
			break;
		}

		// move to next x position
		scanInNegativeXDirection
			? xDistance--
			: xDistance++;
	}

	return {
		distance : Math.round(
			Math.sqrt( // good ol' Pythagoras
				Math.pow(xDistance, 2) +
				Math.pow(yDistance, 2)
			)
		),
		pixels : pixels
	}
}

Raytracing.ViewPoint.prototype.moveNorth = function (distance) { this.setYPos(this.getYPos() - distance); }
Raytracing.ViewPoint.prototype.moveSouth = function (distance) { this.setYPos(this.getYPos() + distance); }
Raytracing.ViewPoint.prototype.moveEast  = function (distance) { this.setXPos(this.getXPos() + distance); }
Raytracing.ViewPoint.prototype.moveWest  = function (distance) { this.setXPos(this.getXPos() - distance); }

Raytracing.ViewPoint.prototype.moveForwards  = function (distance) {
	var rise = distance * Math.sin(Raytracing.Math.degreesToRadians(this.getRotation()));
	var run = Math.sqrt(Math.pow(distance, 2) - Math.pow(rise, 2));

	this.moveSouth(rise);
	this.moveEast(run);
}
Raytracing.ViewPoint.prototype.moveBackwards = function (distance) {
	this.turnLeft(180); // turn to that relative direction
	this.moveForwards(distance); // move forward by that distance
	this.turnRight(180); // turn back to face back to the original direction
}
Raytracing.ViewPoint.prototype.moveLeft      = function (distance) {
	this.turnLeft(90); // turn to that relative direction
	this.moveForwards(distance); // move forward by that distance
	this.turnRight(90); // turn back to face back to the original direction
}
Raytracing.ViewPoint.prototype.moveRight     = function (distance) {
	this.turnRight(90); // turn to that relative direction
	this.moveForwards(distance); // move forward by that distance
	this.turnLeft(90); // turn back to face back to the original direction
}

Raytracing.ViewPoint.prototype.turnLeft  = function (angle) {
	this.setRotation( // set new rotation...
		this.getRotation() - ( // to the current rotation minus...
			isNaN(angle) // either...
				? Raytracing.ViewPoint.DefaultRotationDelta // the default...
				: Number(angle) // or the specified angle...
			) // depending on whether the specified angle is valid
	);
}
Raytracing.ViewPoint.prototype.turnRight = function (angle) {
	this.setRotation( // set new rotation...
		this.getRotation() + ( // to the current rotation plus...
			isNaN(angle) // either...
				? Raytracing.ViewPoint.DefaultRotationDelta // the default...
				: Number(angle) // or the specified angle...
			) // depending on whether the specified angle is valid
	);
}

Raytracing.ViewPoint.FieldOfView = 90; // how many degrees the view point can see
Raytracing.ViewPoint.DefaultRotationDelta = 10; // how many degrees to turn by


/*
  ____             _                  _               ____  _          _                   _        _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  |  _ \(_)_  _____| |  _ __  _ __ ___ | |_ ___ | |_ _   _ _ __   ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | | |_) | \ \/ / _ \ | | '_ \| '__/ _ \| __/ _ \| __| | | | '_ \ / _ \
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_|  __/| |>  <  __/ | | |_) | | | (_) | || (_) | |_| |_| | |_) |  __/
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_|   |_/_/\_\___|_| | .__/|_|  \___/ \__\___/ \__|\__, | .__/ \___|
             |___/                            |___/                       |_|                           |___/|_|
*/
Raytracing.Pixel.prototype.getRed = function () { return this.red; }
Raytracing.Pixel.prototype.setRed = function (red) {
	return 0 <= red && red <= 255
		? this.red = Math.round(red)
		: this.red = NaN;
}

Raytracing.Pixel.prototype.getGreen = function () { return this.green; }
Raytracing.Pixel.prototype.setGreen = function (green) {
	return 0 <= green && green <= 255
		? this.green = Math.round(green)
		: this.green = NaN;
}

Raytracing.Pixel.prototype.getBlue = function () { return this.blue; }
Raytracing.Pixel.prototype.setBlue = function (blue) {
	return 0 <= blue && blue <= 255
		? this.blue = Math.round(blue)
		: this.blue = NaN;
}

Raytracing.Pixel.prototype.isPixelOn = function () {
	return (!isNaN(this.red))   &&
	       (!isNaN(this.green)) &&
	       (!isNaN(this.blue));
}

Raytracing.Pixel.prototype.toHex = function () { return          this.toString("#RGB");          }
Raytracing.Pixel.prototype.toCSS = function () { return "rgb(" + this.toString("r, g, b") + ")"; }
Raytracing.Pixel.prototype.toString = function (format) {
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
		: "[object Raytracing.Pixel]";
}

Raytracing.Pixel.Average = function (xs) { // static method to average a list of pixels
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

		return new Raytracing.Pixel(r, g, b);
	} else {
		return new Raytracing.Pixel();
	}
}


/*
  ____             _                  _               __  __       _   _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  |  \/  | __ _| |_| |__    _ __   __ _ _ __ ___   ___  ___ _ __   __ _  ___ ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | | |\/| |/ _` | __| '_ \  | '_ \ / _` | '_ ` _ \ / _ \/ __| '_ \ / _` |/ __/ _ \
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_| |  | | (_| | |_| | | | | | | | (_| | | | | | |  __/\__ \ |_) | (_| | (_|  __/
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_|  |_|\__,_|\__|_| |_| |_| |_|\__,_|_| |_| |_|\___||___/ .__/ \__,_|\___\___|
             |___/                            |___/                                                           |_|
*/
Raytracing.Math = {}

Raytracing.Math.radiansToDegrees = function (theta) { return theta * 180/Math.PI; }
Raytracing.Math.degreesToRadians = function (theta) { return theta * Math.PI/180; }

Raytracing.Math.degreesToIncline = function (theta) { return Math.tan(Raytracing.Math.degreesToRadians(theta)); }
Raytracing.Math.radiansToIncline = function (theta) { return Math.tan(theta);                                   }

Raytracing.Math.roundToMax = function (value, max) { return Math.round(value) > Number(max) ? Number(max) : Math.round(value); }
Raytracing.Math.roundToMin = function (value, min) { return Math.round(value) < Number(min) ? Number(min) : Math.round(value); }
