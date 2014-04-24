var gulp = require("gulp");
var spawn = require('child_process').spawn;

gulp.task("default", function () {

});

gulp.watch("res/images/**/*.pxm", function (e) {

	if (e.path.indexOf(".pxm") === -1) {
		console.log("wtf gulp?");
		return;
	}

    spawn("./pxm2png", [e.path], {cwd: process.cwd() + "/vendor"});

    console.log("updated:", e.path)
});
