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
	var makeFullScreen = function () {
		$("#outter")
			.width($(window).width())
			.height($(window).height());
	};

	// make the outer wrapper fullscreen and responsive
	makeFullScreen();
	$(window).on("resize", makeFullScreen);

	canvas = new Drawing.Canvas("#canvas", 8)

	var randomSurface = function () {
		return [
			new Drawing.Pixel(
				Math.random() * 255,
				Math.random() * 255,
				Math.random() * 255
			)
		];
	}

	// draw the space border
	for (var x = 0; x < canvas.space.getWidth(); x++) {
		for (var y = 0; y < canvas.space.getLength(); y++) {
			if (y === 0 || y === canvas.space.getLength() - 1 || x === 0 || x == canvas.space.getWidth() - 1) {
				canvas.space.drawPoint(x, y, randomSurface());
			}
	 	}
	}

	// draw some rectangles
	canvas.space.drawRectangle(5, 25, 9, 72, randomSurface());
	canvas.space.drawRectangle(15, 75, 19, 92, randomSurface());
	canvas.space.drawRectangle(25, 15, 29, 48, randomSurface());
	canvas.space.drawRectangle(95, 5, 36, 43, randomSurface());
	canvas.space.drawRectangle(95, 75, 56, 93, randomSurface());

	// draw some circles
	canvas.space.drawCircle(30, 70, 10, randomSurface())

	setInterval(function () {
		canvas.drawFrame(new Drawing.Frame(Math.round(canvas.getWidth() / canvas.getScale()),
		                                   Math.round(canvas.getHeight() / canvas.getScale()),
		                                   canvas.space.map()))
	}, 1000 / Drawing.Canvas.FramesPerSecond);

	// wire up some keyboard controls
	$(window).on("keydown", function (event) {
		var key = event.key.toLowerCase();
		var alt = event.altKey;
		var shf = event.shiftKey;
		var ctl = event.ctrlKey;

		switch (key) {
			case "w":
			case "arrowup":
				canvas.space.viewPoint.moveNorth(1);
				break;
			case "a":
			case "arrowleft":
				canvas.space.viewPoint.moveWest(1);
				break;
			case "s":
			case "arrowdown":
				canvas.space.viewPoint.moveSouth(1);
				break;
			case "d":
			case "arrowright":
				canvas.space.viewPoint.moveEast(1);
				break;
		}
	});
});
