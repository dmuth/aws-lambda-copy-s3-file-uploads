

var gulp = require("gulp");
var zip = require("gulp-zip");

gulp.task('default', function() {
	console.log("Hello world!");

});

gulp.task("zip", function() {
	return(
		gulp.src(["copyFileFromS3.js", "node_modules/**/*"])
			.pipe(zip("copyFileFromS3.zip"))
			.pipe(gulp.dest("dist"))
		);

});


