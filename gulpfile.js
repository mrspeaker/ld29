/* global require, process */

"use strict";

var gulp = require("gulp"),
	gutil = require("gulp-util"),
	es6transpiler = require("gulp-es6-transpiler"),
	spawn = require("child_process").spawn,

	imgGlob = "res/images/**/*.pxm",
	audioGlob = "res/audio/**/*.wav",
	srcGlob = "src/**/*.js";

gulp.task("default", function () {
	gulp.start("es62es5");
});

gulp.task("es62es5", function () {
	gulp.src(srcGlob)
		.pipe(es6transpiler({
			"globals": {
				"Ω": true
			},
			"devel": true
		}))
		.on("error", gutil.log)
		.pipe(gulp.dest("scripts"));
});

gulp.task("watch", function() {
	gulp.start("default");
	gulp.watch(srcGlob, ["es62es5"]);
	gulp.watch(imgGlob, pxm2png);
	gulp.watch(audioGlob, wav2comp);
});

function pxm2png (e) {
	//console.log("PXM:", e);
	if (e.path.indexOf(".pxm") === -1) {
		console.log("wtf gulp?");
		return;
	}
	var path = e.path.split("/"),
		file = path[path.length - 1];

	if (e.type === "deleted") {
		console.log("deleted:", file);
		return;
	}

	spawn("./pxm2png", [e.path], {cwd: process.cwd() + "/lib/tools/"});

	console.log("PNG'd:", file);
}

function wav2comp (e) {
	//console.log("WAV:", e);
	if (e.path.indexOf(".wav") === -1) {
		console.log("wtf gulp?");
		return;
	}
	var path = e.path.split("/"),
		file = path[path.length - 1];

	if (e.type === "deleted") {
		console.log("deleted:", file);
		return;
	}

	var sound = e.path.slice(0, -4);
	spawn("ffmpeg", ["-y", "-i", sound + ".wav", sound + ".ogg", sound + ".mp3"]);

	console.log("Ogg n mp3'd:", file);
}
