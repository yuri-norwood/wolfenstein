// raytracing namespace for "3D" (actually 2 and a half D) abstraction
var Raytracing = {
	Space : function (w, l, h) { // constructor for a new 3D space
		var defaults = { w : 100, l : 100, h : 10 }; // default parameters

		// getters / setters
		this.getWidth = function () {
			return this._width;
		};
		this.setWidth = function (width) {
			this._width = width || defaults.w;
		};

		this.getLength = function () {
			return this._length;
		};
		this.setLength = function (length) {
			this._length = length || defaults.l;
		};

		this.getHeight = function () {
			return this._height;
		};
		this.setHeight = function (height) {
			this._height = height || defaults.h;
		};

		// fields
		this.setWidth(w);  // width of area
		this.setHeight(l); // length of area
		this.setLength(h); // height of area
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

			// scan all currently visible pixels
			var scanLines = this.viewPoint.scan();
			
			// perspectiveRatio dictates how small things in the distance are
			var perspectiveRatio = 0.75;

			for (var x = 0; x < w; x++) {
				screen.push([]); // add a pixel column to the screen

				// these are the pixels for the current angle
				var pixels = scanLines[TODO].pixels;
				
				// the distance from the view point these pixels
				var distance = scanLines[TODO].distance;

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
		var invalidParamater = function (name, value) {
			throw "Cannot initialize Raytracing.ViewPoint: invalid value '" + value + "' for parameter " + name;
		};

		if (!space) {
			invalidParamater("space", space);
		} else if (isNaN(x)) {
			invalidParamater("x", x);
		} else if (isNaN(y)) {
			invalidParamater("y", y);
		} else if (isNaN(r)) {
			invalidParamater("r", r);
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
		this.scan = function () { // returns a list of pixel columns 
			// for each degree of the field of view, trace to the first stack of
			// "on" pixels (i.e. all pixels are turned on) and return a list of
			// pixel stacks and their distances from the current position.
			var scan = [];

			for (var i = 0; i < Raytracing.ViewPoint.FieldOfView; i++) {
				var pixels = []; // TODO
				var distance = 0; // TODO
				
				scan.push({pixels : pixels, distance : distance});
			}

			return scan;
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
			return this.isPixelOn()
				? "" // just an empty string
				: "#" + this.getRed().toString(16) +
			             this.getGreen().toString(16) +
			             this.getBlue().toString(16);
		}

		this.toCSS = function () {
			return this.isPixelOn()
				? "" // just an empty string
				: "rgb(" + this._r + ", " + this._g + ", " + this._b + ")";
		};
	},
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
