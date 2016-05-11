

var exec = require('child_process').exec;

var gulp = require("gulp");
var zip = require("gulp-zip");


/**
* Wrapper to run a command.
*/
function runCmd(cmd, cb) {

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

} // End of runCmd()


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

	runCmd(cmd, function(error) {
		cb(error);
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

	runCmd(cmd, function(error) {
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

	runCmd(cmd, function(error) {

		if (!error) {
			console.log("# ");
			console.log("# Results written to output.txt");
			console.log("# ");
		}

		cb(error);
	});


});



gulp.task("remove-permission", function(cb) {

	var cmd = "aws lambda remove-permission "
		+ "--profile lambda-test "
		+ "--function-name copyFileFromS3 "
		+ "--statement-id lambda-permission-s3-test123 "
		;
	//console.log("CMD", cmd); // Debugging

	runCmd(cmd, function(error) {
		cb();
	});

});


//
// Add permissions to our Lambda function
//
gulp.task("add-permission", ["remove-permission"], function(cb) {

	var cmd = "aws lambda add-permission "
		+ "--function-name copyFileFromS3 "
		+ "--region us-east-1 "
		+ "--statement-id lambda-permission-s3-test123 "
		+ "--action \"lambda:InvokeFunction\" "
		+ "--principal s3.amazonaws.com "
		+ "--source-arn arn:aws:s3:::dmuth-test-src "
		+ "--source-account 287061943401 "
		+ "--profile lambda-test "
		;
	//console.log("CMD", cmd); // Debugging

	runCmd(cmd, function(error) {
		cb(error);
	});

});


//
// Add permissions to our Lambda function
//
gulp.task("get-policy", function(cb) {

	var cmd = "aws lambda get-policy "
		+ "--function-name copyFileFromS3 "
		+ "--profile lambda-test "
		;
	//console.log("CMD", cmd); // Debugging

	runCmd(cmd, function(error) {
		cb(error);
	});

});




