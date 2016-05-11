

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


gulp.task("delete", function(cb) {

	var cmd = "aws lambda delete-function "
		+ "--region us-east-1 "
		+ "--function-name copyFileFromS3 "
		+ "--profile lambda-test "
		;
	//console.log("CMD", cmd); // Debugging

	console.log("About to delete our function.  Don't worry if this throws an error.");

	exec(cmd, function (error, stdout, stderr) {

		if (stdout) {
			console.log(stdout);
		}

		if (stderr) {
			console.log(stderr);
		}

		if (error) {
			//console.log(error); // Debugging
		}

		cb();

	});


});


//
// Upload our zipfile
//
gulp.task("upload", ["zip", "delete"], function(cb) {

	var cmd = "aws lambda create-function "
		+ "--region us-east-1 "
		+ "--function-name copyFileFromS3 "
		+ "--zip-file fileb://dist/copyFileFromS3.zip "
		+ "--role arn:aws:iam::287061943401:role/lamba-execute "
		+ "--handler copyFileFromS3.handler "
		+ "--runtime nodejs4.3 "
		+ "--profile lambda-test "
		+ "--timeout 10 "
		+ "--memory-size 1024"
		;
	//console.log("CMD", cmd); // Debugging

	exec(cmd, function (error, stdout, stderr) {

		if (stdout) {
			console.log(stdout);
		}

		if (stderr) {
			console.log(stderr);
		}

		if (error) {
			//console.log(error); // Debugging
		}

		cb(error);

	});


});


//
// Test our function out
//
gulp.task("test", function(cb) {

	var cmd = "aws lambda invoke "
		//+ "--invocation-type RequestResponse "
		+ "--invocation-type Event "
		+ "--function-name copyFileFromS3 "
		+ "--region us-east-1 "
		//+ "--role arn:aws:iam::287061943401:role/lamba-execute "
		+ "--payload file://test/input.txt "
		+ "--profile lambda-test "
		+ "output.txt"
		;
	//console.log("CMD", cmd); // Debugging

	exec(cmd, function (error, stdout, stderr) {

		if (stdout) {
			console.log(stdout);
		}

		if (stderr) {
			console.log(stderr);
		}

		if (error) {
			//console.log(error); // Debugging
		}

		cb(error);

	});


});

