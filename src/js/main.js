$(window).on("load", function () {
	var makeFullScreen = function () {
		$("#outter")
			.width($(window).width())
			.height($(window).height());
	};
	
	makeFullScreen();
	$(window).on("resize", makeFullScreen);
});
