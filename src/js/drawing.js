function draw_frame(ctxt, frame, x_unit, y_unit) {
	for (var i = 0; i < frame.length; i++) {
		ctxt.beginPath();
		ctxt.rect(
			(i % 100) * x_unit,
			Math.floor(i / 100) * y_unit,
			x_unit,
			y_unit
		);
		ctxt.fillStyle = "rgb(" +
			frame[i].r + "," +
			frame[i].g + "," +
			frame[i].b +
		")";
		ctxt.fill();
		ctxt.stroke();
	}
}

$(window).on("load", function () {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var x_unit = canvas.width / 100;
	var y_unit = canvas.height / 100;
	var framesPerSec = 2;
	var defaultSurface = [
		new Raytracing.Pixel(
			Math.random() * 255,
			Math.random() * 255,
			Math.random() * 255
		)
	];

	space = new Raytracing.Space(100, 100, 100);
	for (var x = 0; x < space.getWidth(); x++) {
		for (var y = 0; y < space.getLength(); y++) {
			if (y === 0 || y === space.getLength() - 1 || x === 0 || x == space.getWidth() - 1) {
				space.drawPoint(x, y, defaultSurface);
			}
		}
	}

	space.drawRectangle(5, 25, 9, 72, defaultSurface);
	space.drawRectangle(15, 75, 19, 92, defaultSurface);
	space.drawRectangle(25, 15, 29, 48, defaultSurface);
	space.drawRectangle(95, 5, 36, 43, defaultSurface);
	space.drawRectangle(95, 75, 56, 93, defaultSurface);

	// setInterval(function () {
	// 	space.viewPoint.turnLeft();

	// 	var grid = space.render(100, 100, 1000);
	// 	var frame = [];

	// 	for (var x = 0; x < grid.length; x++) {
	// 		for (var y = 0; y < grid[x].length; y++) {
	// 			frame.push({
	// 				r : grid[x][y].getRed(),
	// 				g : grid[x][y].getGreen(),
	// 				b : grid[x][y].getBlue()
	// 			});
	// 		}
	// 	}

	// 	draw_frame(context, frame, x_unit, y_unit);
	// }, 1000 / framesPerSec);
});
