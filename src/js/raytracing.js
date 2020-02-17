// raytracing namespace for "3D" (actually 2 and a half D) abstraction
var Raytracing = {
	Math : { // namespace for math extension static methods
		// unit conversions
		radiansToDegrees : function (theta) { return theta * 180/Math.PI; },
		degreesToRadians : function (theta) { return theta * Math.PI/180; },

		// incline ratios
		radiansToIncline : function (theta) {
			return Math.tan(theta);
		},
		degreesToIncline : function (theta) {
			return Math.tan(Raytracing.Math.degreesToRadians(theta));
		},

		// max/min values
		roundToMax : function (value, max) {
			return Math.round(value) > Number(max)
				? Number(max)
				: Math.round(value);
		},
		roundToMin : function (value, min) {
			return Math.round(value) < Number(min)
				? Number(min)
				: Math.round(value);
		}
	},

	Exception : function (message) {
		return Object.create(Error.prototype,
							{
								message : {
									value : message
								}
							});
	},

	Space : function (w, l, h) { // constructor for a new 3D space
		// validation
		if (isNaN(w)) {
			throw new Raytracing.Exception("Invalid constructor parameter: w passed as " + w);
		}
		if (isNaN(l)) {
			throw new Raytracing.Exception("Invalid constructor parameter: l passed as " + l);
		}
		if (isNaN(h)) {
			throw new Raytracing.Exception("Invalid constructor parameter: h passed as " + h);
		}

		// getters / setters
		this.getWidth = function () {
			return this._width;
		};
		this.setWidth = function (width) {
			this._width = width;
		};

		this.getLength = function () {
			return this._length;
		};
		this.setLength = function (length) {
			this._length = length;
		};

		this.getHeight = function () {
			return this._height;
		};
		this.setHeight = function (height) {
			this._height = height;
		};

		this.getPixelsAt = function (x, y) {
			return this._grid[x][y];
		};

		// fields
		this.setWidth(w);  // width of area
		this.setLength(l); // height of area
		this.setHeight(h); // length of area
		this.viewPoint = new Raytracing.ViewPoint(this,
		                                          Math.floor(this._width / 2),
		                                          Math.floor(this._length / 2),
		                                          0);
		this._grid = []; // create the internal abstraction
		for (var x = 0; x < w; x++) {
			var col = []; // column to add
			for (var y = 0; y < l; y++) {
				var row = []; // row to add
				for (var z = 0; z < h; z++) {
					row.push(new Raytracing.Pixel());
				}
				col.push(row);
			}
			this._grid.push(col);
		}

		// methods
		this.render = function (w, h, blurDistance) {
			// returns a w by h grid of pixels to draw
			var screen = [];

			// calculate the angle in degrees of each horizontal pixel
			var anglePerPixel = Raytracing.ViewPoint.FieldOfView / w;
			var startingAngle = this.viewPoint.getRotation() - Raytracing.ViewPoint.FieldOfView / 2;
			
			// perspectiveRatio dictates how small things in the distance are
			var perspectiveRatio = 0.75;

			for (var x = 0; x < w; x++) {
				screen.push([]); // add a pixel column to the screen

				// scan all currently visible pixels
				var scanLine = this.viewPoint.scan(startingAngle + (anglePerPixel * x));

				// these are the pixels for the current angle
				var pixels = scanLine.pixels;
				
				// the distance from the view point these pixels
				var distance = scanLine.distance;

				// calculate which pixels to keep
				var pixelsToUse = [];
				if (distance > blurDistance) {
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
				for (var topPadding = 0; topPadding < Math.floor((h - pixelsToUse.length) / 2); topPadding++) {
					screen[x].push(new Raytracing.Pixel());
				}

				// add pixes the screen column
				for (var pixelToUse = 0; pixelToUse < pixelsToUse.length; pixelToUse++) {
					screen[x].push(pixelsToUse[pixelToUse]);
				}

				// add empty pixels to screen column until column full
				while (screen[x].length < h) {
					screen[x].push(new Raytracing.Pixel());
				}
			}

			return screen;
		};
	},
	
	ViewPoint : function (space, x, y, r) { // constructor for a new view point
		// validation
		if (!space instanceof Raytracing.Space) {
			throw new Raytracing.Exception("Invalid constructor parameter: space passed as " + space);
		}
		if (isNaN(x)) {
			throw new Raytracing.Exception("Invalid constructor parameter: x passed as " + x);
		}
		if (isNaN(y)) {
			throw new Raytracing.Exception("Invalid constructor parameter: y passed as " + y);
		}
		if (isNaN(r)) {
			throw new Raytracing.Exception("Invalid constructor parameter: r passed as " + r);
		}

		// getters / setters
		this.getXPos = function () {
			return this._x;
		};
		this.setXPos = function (newX) {
			if (0 <= newX && newX <= this._space.getWidth()) {
				this._x = newX;
			} else {
				this._x = newX < 0 ? 0 : this._space.getWidth();
			}
		};

		this.getYPos = function () {
			return this._y;
		};
		this.setYPos = function (newY) {
			if (0 <= newY && newY <= this._space.getLength()) {
				this._y = newY;
			} else {
				this._y = newY < 0 ? 0 : this._space.getLength();
			}
		};

		this.getRotation = function () {
			return this._r;
		};
		this.setRotation = function (rotation) {
			if (0 <= rotation && rotation <= 359) {
				this._r = rotation;
			} else if (rotation > 0) {
				this._r = rotation % 360;
			} else {
				while (rotation < 0) {
					rotation += 360;
				}
				this._r = rotation;
			}
		};

		// fields
		this._space = space; // the space this point occupies
		this.setXPos(x);     // x position of point
		this.setYPos(y);     // y position of point
		this.setRotation(r); // rotation of point
		
		// methods
		this.scan = function (angle) { // returns pixels and distance at angle
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
			       xDistance <= this.space.getWidth()
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
					stopScanning = pixels.every(function (pixel) {
						return pixel.isPixelOn();
					});

					// break out early if scan line hit something
					if (stopScanning) {
						break;
					}

					// move to next y position
					scanInNegativeYDirection
						? yDistance++
						: yDistance--;
				}

				// break out early if scan line hit something
				if (stopScanning) {
					break;
				}

				// move to next x position
				scanInNegativeXDirection
					? xDistance++
					: xDistance--;
			}

			return {
				distance : Math.round(
					Math.sqrt( // good ol' Pythagoras
						Math.pow(xDistance, 2) +
						Math.pow(yDistance, 2)
					)
				),
				pixels : pixels
			};
		};

		this.moveForwards  = function () { throw "TODO" };
		this.moveBackwards = function () { throw "TODO" };
		this.moveLeft      = function () { throw "TODO" };
		this.moveRight     = function () { throw "TODO" };
		
		this.turnLeft  = function () { throw "TODO" };
		this.turnRight = function () { throw "TODO" };
	},
	
	Pixel : function (r, g, b) { // constructor for a new pixel
		// getters / setters
		this.getRed = function () {
			return this._r;
		};
		this.setRed = function (red) {
			if (0 <= red && red <= 255) {
				this._r = Math.round(red);
			} else {
				this._r = NaN;
			}
		};

		this.getGreen = function () {
			return this._g;
		};
		this.setGreen = function (green) {
			if (0 <= green && green <= 255) {
				this._g = Math.round(green);
			} else {
				this._g = NaN;
			}
		};

		this.getBlue = function () {
			return this._b;
		};
		this.setBlue = function (blue) {
			if (0 <= blue && blue <= 255) {
				this._b = Math.round(blue);
			} else {
				this._b = NaN;
			}
		};

		// fields
		this.setRed(r);   // red component
		this.setGreen(g); // green component
		this.setBlue(b);  // blue component

		// methods
		this.isPixelOn = function () {
			return !isNaN(this._r) &&
			       !isNaN(this._g) &&
			       !isNaN(this._b);
		};

		this.toHex = function () {
			return this.toString("#RGB");
		}

		this.toCSS = function () {
			return "rgb(" + this.toString("r, g, b") + ")";
		};
		
		this.toString = function (format) {
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
				: "[object Raytracing.Pixel]" ;
		};
	}
};

// static methods and values
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
};

Raytracing.ViewPoint.FieldOfView = 90; // how many degrees the view point can see
