"use strict";

/*
  ____ _       _           _
 / ___| | ___ | |__   __ _| |___
| |  _| |/ _ \| '_ \ / _` | / __|
| |_| | | (_) | |_) | (_| | \__ \
 \____|_|\___/|_.__/ \__,_|_|___/

*/
var canvas;

/*
 ___       _ _   _       _ _          _   _
|_ _|_ __ (_) |_(_) __ _| (_)______ _| |_(_) ___  _ __
 | || '_ \| | __| |/ _` | | |_  / _` | __| |/ _ \| '_ \
 | || | | | | |_| | (_| | | |/ / (_| | |_| | (_) | | | |
|___|_| |_|_|\__|_|\__,_|_|_/___\__,_|\__|_|\___/|_| |_|

*/
$(document).ready(function () {
	// wire up color scheme
	$("body, #outer")
		.addClass("background-normal")
		.addClass("foreground-normal")
		.addClass("border-normal");
})

/*
__     __    _     _   __  __       _          __                    __
\ \   / /__ (_) __| | |  \/  | __ _(_)_ __    / /__ _ _ __ __ ___   _\ \
 \ \ / / _ \| |/ _` | | |\/| |/ _` | | '_ \  | |/ _` | '__/ _` \ \ / /| |
  \ V / (_) | | (_| | | |  | | (_| | | | | | | | (_| | | | (_| |\ V / | |
   \_/ \___/|_|\__,_| |_|  |_|\__,_|_|_| |_| | |\__,_|_|  \__, | \_/  | |
                                              \_\         |___/      /_/
*/
$(window).on("load", function () {
	var showMap = false;

	var makeFullScreen = function () {
		$("#outter")
			.width($(window).width())
			.height($(window).height());
	};

	var updateCompass = function () {
		if (!showMap) {
			return;
		}

		canvas.beginPath();

		// point in front of viewPoint
		var tmp = canvas.space.viewPoint.getRotation();
		canvas.space.viewPoint.setRotation(tmp + 180);
		var theta = Raytracing.Math.degreesToRadians(canvas.space.viewPoint.getRotation());
		canvas.space.viewPoint.setRotation(tmp);
		var x = canvas.getWidth()  - (canvas.space.viewPoint.getXPos() * canvas.getScale() + canvas.getScale() / 2) + (Math.sin(theta) * canvas.getScale() * 2);
		var y = canvas.getHeight() - (canvas.space.viewPoint.getYPos() * canvas.getScale() + canvas.getScale() / 2) + (Math.cos(theta) * canvas.getScale() * 2);
		canvas._context.moveTo((x + (Math.sin(theta) * canvas.getScale())),
		                       (y + (Math.cos(theta) * canvas.getScale())));

		// point to left of viewPoint
		var tmp = canvas.space.viewPoint.getRotation();
		canvas.space.viewPoint.setRotation(tmp + 90);
		var theta = Raytracing.Math.degreesToRadians(canvas.space.viewPoint.getRotation());
		canvas.space.viewPoint.setRotation(tmp);
		canvas._context.lineTo((x + (Math.sin(theta) * canvas.getScale())),
		                       (y + (Math.cos(theta) * canvas.getScale())));

		// point to right of viewPoint
		var tmp = canvas.space.viewPoint.getRotation();
		canvas.space.viewPoint.setRotation(tmp - 90);
		var theta = Raytracing.Math.degreesToRadians(canvas.space.viewPoint.getRotation());
		canvas.space.viewPoint.setRotation(tmp);
		canvas._context.lineTo((x + (Math.sin(theta) * canvas.getScale())),
		                       (y + (Math.cos(theta) * canvas.getScale())));

		canvas.fillStyle("rgb(255, 255, 255)");
		canvas.fill();
	}

	var randomPixel = function () {
		return new Drawing.Pixel(Math.round(Math.random() * 255),
		                         Math.round(Math.random() * 255),
		                         Math.round(Math.random() * 255));
	}

	// make the outer wrapper fullscreen and responsive
	makeFullScreen();
	$(window).on("resize", makeFullScreen);

	window.onerror = function (message, source, lineno, colno, error) {
		$("#outter").append(
			"<p class=\"error-message\">" +
				source + " at line " + lineno + ": " + message +
			"</p>"
		);
	}

	canvas = new Drawing.Canvas("#canvas", 8)

	// draw the space border
	for (var x = 0; x < canvas.space.getWidth(); x++) {
		for (var y = 0; y < canvas.space.getLength(); y++) {
			if (y === 0 || y === canvas.space.getLength() - 1 || x === 0 || x == canvas.space.getWidth() - 1) {
				canvas.space.drawPoint(x, y, Drawing.Colors.White);
			}
	 	}
	}

	// draw some rectangles
	canvas.space.drawRectangle(5, 25, 9, 72, Drawing.Colors.Grey);
	canvas.space.drawRectangle(15, 75, 19, 92, Drawing.Colors.Grey);
	canvas.space.drawRectangle(25, 15, 29, 48, Drawing.Colors.Grey);
	canvas.space.drawRectangle(95, 5, 36, 43, Drawing.Colors.Grey);
	canvas.space.drawRectangle(95, 75, 56, 93, Drawing.Colors.Grey);

	// draw some circles
	canvas.space.drawCircle(30, 70, 10, Drawing.Colors.Green);

	setInterval(function () {
		if (showMap) {
			canvas.drawFrame(canvas.map());
		} else {
			canvas.drawFrame(canvas.render());
		}

		updateCompass();
	}, 1000 / Drawing.Canvas.FramesPerSecond);

	// wire up some keyboard controls
	$(window).on("keydown", function (event) {
		var key = event.key.toLowerCase();
		var alt = event.altKey;
		var shf = event.shiftKey;
		var ctl = event.ctrlKey;

		switch (key) {
			case "arrowup":
				canvas.space.viewPoint.moveNorth(1);
				break;
			case "arrowleft":
				canvas.space.viewPoint.moveWest(1);
				break;
			case "arrowdown":
				canvas.space.viewPoint.moveSouth(1);
				break;
			case "arrowright":
				canvas.space.viewPoint.moveEast(1);
				break;
			case "w":
				canvas.space.viewPoint.moveForwards(1);
				break;
			case "a":
				canvas.space.viewPoint.turnLeft(15);
				break;
			case "s":
				canvas.space.viewPoint.moveBackwards(1);
				break;
			case "d":
				canvas.space.viewPoint.turnRight(15);
				break;
		}
	});
});
