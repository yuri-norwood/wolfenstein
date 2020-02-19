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
  ____             _                  _               ____                          ____ _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ _  / ___| _ __   __ _  ___ ___   / ___| | __ _ ___ ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` | \___ \| '_ \ / _` |/ __/ _ \ | |   | |/ _` / __/ __|
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |_ ___) | |_) | (_| | (_|  __/ | |___| | (_| \__ \__ \
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)____/| .__/ \__,_|\___\___|  \____|_|\__,_|___/___/
             |___/                            |___/        |_|
*/
Raytracing.Space = function (width, length, height) {
	// validation
	if (isNaN(width)) {
		throw new TypeError("Raytracing.Space(): width passed as " + width);
	}
	if (isNaN(length)) {
		throw new TypeError("Raytracing.Space(): length passed as " + length);
	}
	if (isNaN(height)) {
		throw new TypeError("Raytracing.Space(): height passed as " + height);
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
				row.push(new Drawing.Pixel());
			}
			col.push(row);
		}
		this._grid.push(col);
	}
},

Raytracing.Space.prototype.getWidth = function ()      { return this._width;  }
Raytracing.Space.prototype.setWidth = function (width) { this._width = width; }

Raytracing.Space.prototype.getLength = function ()       { return this._length;   }
Raytracing.Space.prototype.setLength = function (length) { this._length = length; }

Raytracing.Space.prototype.getHeight = function ()       { return this._height;   }
Raytracing.Space.prototype.setHeight = function (height) { this._height = height; }

Raytracing.Space.prototype.getPixelsAt = function (x, y) { return 0 <= x && x < this.getWidth() && 0 <= y && y < this.getLength() && this._grid[x][y] ? this._grid[x][y] : []; }
Raytracing.Space.prototype.arePixelsOn = function (x, y) { return this.getPixelsAt(x, y).length > 0 && this.getPixelsAt(x, y).every(pixel => pixel.isPixelOn()); }

Raytracing.Space.prototype.drawPoint = function (x, y, pixels) {
	// validate the pixels
	if (pixels.length <= 0 || !pixels.every(pixel => pixel instanceof Drawing.Pixel && pixel.isPixelOn())
	) {
		throw new TypeError("Raytracing.Space.drawPoint(" + x + ", " + y + ", " + pixels + "): not all pixels in (" + pixels + ") are valid Drawing.Pixel instances");
	}

	// pad the pixels to ensure there are enough
	var i = 0;
	while (pixels.length < this.getHeight()) {
		pixels.push(pixels[i++]);
	}

	// populate the point
	if (0 <= x && x < this.getWidth() && 0 <= y && y < this.getLength()) {
		for (var z = 0; z < this.getHeight(); z++) {
			this._grid[Math.round(x)][Math.round(y)][z] = pixels[z];
		}
	}
}

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

Raytracing.Space.prototype.drawCircle = function (x, y, r, pixels) {
	var r = Math.abs(r);
	var tolerance = 0.5;

	for (var i = x - r; i <= x + r; i++) {
		for (var j = y - r; j <= y + r; j++) {
			if ((Raytracing.Math.distance(x, y, i, j) - tolerance) > r ||
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
		map.push([]);
		for (var y = 0; y < this.getLength(); y++) {
			map[x][y] = (Math.round(this.viewPoint.getXPos()) == x &&
			             Math.round(this.viewPoint.getYPos()) == y
			             ? new Drawing.Pixel(255, 0, 0)
			             : this.arePixelsOn(x, y)
			              ? new Drawing.Pixel(255, 255, 255)
			              : new Drawing.Pixel(0, 0, 0));
		}
	}

	return map;
}

Raytracing.Space.prototype.render = function (width, height, blurDistance) { throw new Error("Unimplemented"); }


/*
  ____             _                  _           __     ___               ____       _       _      ____ _
 |  _ \ __ _ _   _| |_ _ __ __ _  ___(_)_ __   __ \ \   / (_) _____      _|  _ \ ___ (_)_ __ | |_   / ___| | __ _ ___ ___
 | |_) / _` | | | | __| '__/ _` |/ __| | '_ \ / _` \ \ / /| |/ _ \ \ /\ / / |_) / _ \| | '_ \| __| | |   | |/ _` / __/ __|
 |  _ < (_| | |_| | |_| | | (_| | (__| | | | | (_| |\ V / | |  __/\ V  V /|  __/ (_) | | | | | |_  | |___| | (_| \__ \__ \
 |_| \_\__,_|\__, |\__|_|  \__,_|\___|_|_| |_|\__, (_)_/  |_|\___| \_/\_/ |_|   \___/|_|_| |_|\__|  \____|_|\__,_|___/___/
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


Raytracing.ViewPoint.prototype.getXPos = function () { return this._x; }
Raytracing.ViewPoint.prototype.setXPos = function (x) {
	return 0 <= x && x < this._space.getWidth()
		? this._x = x
		: this._x = x >= 0
			? this._space.getWidth() - 1
			: 0;
}

Raytracing.ViewPoint.prototype.getYPos = function () { return this._y; }
Raytracing.ViewPoint.prototype.setYPos = function (y) {
	return 0 <= y && y < this._space.getLength()
		? this._y = y
		: this._y = y >= 0
			? this._space.getLength() - 1
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

Raytracing.ViewPoint.prototype.distanceTo = function (x, y) { return Math.round(Raytracing.Math.distance(this.getXPos(), this.getYPos(), x, y)); }

Raytracing.ViewPoint.prototype.scan = function (angle) { throw new Error("Unimplemented"); }

Raytracing.ViewPoint.prototype.moveNorth = function (distance) {
	var direction = -1;
	var delta = isNaN(distance)
		? Raytracing.ViewPoint.DefaultMovementDistance
		: distance;

	for (var i = 1; i < delta + 1; i++) {
		if (this._space.arePixelsOn(this.getXPos(), this.getYPos() + (direction * i))) {
			break;
		}

		this.setYPos(this.getYPos() + (direction * i));
	}
}
Raytracing.ViewPoint.prototype.moveSouth = function (distance) {
	var direction = +1;
	var delta = isNaN(distance)
		? Raytracing.ViewPoint.DefaultMovementDistance
		: distance;

	for (var i = 1; i < delta + 1; i++) {
		if (this._space.arePixelsOn(this.getXPos(), this.getYPos() + (direction * i))) {
			break;
		}

		this.setYPos(this.getYPos() + (direction * i));
	}
}
Raytracing.ViewPoint.prototype.moveEast  = function (distance) {
	var direction = +1;
	var delta = isNaN(distance)
		? Raytracing.ViewPoint.DefaultMovementDistance
		: distance;

	for (var i = 1; i < delta + 1; i++) {
		if (this._space.arePixelsOn(this.getXPos() + (direction * i), this.getYPos())) {
			break;
		}

		this.setXPos(this.getXPos() + (direction * i));
	}
}
Raytracing.ViewPoint.prototype.moveWest  = function (distance) {
	var direction = -1;
	var delta = isNaN(distance)
		? Raytracing.ViewPoint.DefaultMovementDistance
		: distance;

	for (var i = 1; i < delta + 1; i++) {
		if (this._space.arePixelsOn(this.getXPos() + (direction * i), this.getYPos())) {
			break;
		}

		this.setXPos(this.getXPos() + (direction * i));
	}
}

Raytracing.ViewPoint.prototype.moveForwards  = function (distance) {
	var theta = Raytracing.Math.degreesToRadians(this.getRotation());
	var x = Math.round(Math.cos(theta) * distance);
	var y = Math.round(Math.sin(theta) * distance);

	x >= 0 ? this.moveEast(x)  : this.moveWest(x);
	y >= 0 ? this.moveNorth(y) : this.moveSouth(y);
}
Raytracing.ViewPoint.prototype.moveBackwards = function (distance) { throw new Error("Unimplemented") }
Raytracing.ViewPoint.prototype.moveLeft      = function (distance) { throw new Error("Unimplemented") }
Raytracing.ViewPoint.prototype.moveRight     = function (distance) { throw new Error("Unimplemented") }

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
Raytracing.ViewPoint.DefaultMovementDistance = 10; // how far to move by


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

Raytracing.Math.distance = function (x1, y1, x2, y2) { return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2)); }
Raytracing.Math.incline  = function (x1, y1, x2, y2) { return Math.abs(Number(y1) - Number(y2)) / Math.abs(Number(x1) - Number(x2));      }
