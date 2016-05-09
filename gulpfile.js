

var exec = require('child_process').exec;

var gulp = require("gulp");
var zip = require("gulp-zip");


//
// Zip up our code and modules.
//
gulp.task("zip", function() {
	return(
		gulp.src(["copyFileFromS3.js", "node_modules/**/*"])
			.pipe(zip("copyFileFromS3.zip"))
			.pipe(gulp.dest("dist"))
		);

});


//
// Upload our zipfile
//
gulp.task("upload", function(cb) {

	var cmd = "aws lambda create-function "
		+ "--region us-east-1 "
		+ "--function-name copyFileFromS3 "
		+ "--zip-file fileb://dist/copyFileFromS3.zip "
		+ "--role arn:aws:iam::287061943401:role/lamba-execute "
		+ "--handler copyFileFromS3.handler "
		+ "--runtime nodejs4.3 "
		+ "--profile lambda-test "
		+ "--timeout 10 "
		+ "--memory-size 1024";
	//console.log("CMD", cmd); // Debugging

	exec(cmd, function (err, stdout, stderr) {
		console.log("STDOUT", stdout);
		console.log("STDERR", stderr);
		cb(err);
	});


});



