$(document).ready(function () {
	// wire up color scheme
	$("body, #outer")
		.addClass("background-normal")
		.addClass("foreground-normal")
		.addClass("border-normal");
})

$(window).on("load", function () {
	var makeFullScreen = function () {
		$("#outter")
			.width($(window).width())
			.height($(window).height());
	};
	
	// make the outer wrapper fullscreen and responsive
	makeFullScreen();
	$(window).on("resize", makeFullScreen);
});
