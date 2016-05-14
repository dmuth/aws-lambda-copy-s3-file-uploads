/**
* Our Gulpfile containing tasks to run.
* Major tasks:
*
* - get-policy - Retrieve the policy of our function.  Useful for testing.
* - upload - Create a ZIP archive of the Lambda app and upload it
* - delete - Delete the Lambda function from AWS
* - add-permission - Add permission to the S3 bucket to execute this Lambda function
* - remove-permission - Remove the permission from the S3 bucket
*
* - test - Send the contents of test/input.txt into the function in AWS. Results are logged in Cloudwatch.
*
* - go - upload, add-permission
*
*/


var gulp = require("gulp");

var config = require("config");
var zip = require("gulp-zip");

var exec = require('child_process').exec;


/**
* Wrapper to run a command.
*/
function runCmd(cmd, cb) {

	//console.log("CMD", cmd);
	exec(cmd, function (error, stdout, stderr) {

		if (stdout) {
			console.log("Stdout:", stdout);
		}

		if (stderr) {
			console.log("Stderr:", stderr);
		}

		if (error) {
			//console.log(error); // Debugging
		}

		cb(error);

	});

} // End of runCmd()


//
// Top level task to run everything else
//
gulp.task("go", ["add-permission"], function(cb) {
	cb();
});


gulp.task("nuke", ["delete", "remove-permission"], function(cb) {
	cb();
});


//
// Zip up our code and modules.
//
gulp.task("zip", function() {
	return(
		gulp.src(["copyFileFromS3.js", "node_modules/**/*", "config/**/*"])
			.pipe(zip("copyFileFromS3.zip"))
			.pipe(gulp.dest("dist"))
		);

});


gulp.task("delete", function(cb) {

	var cmd = "aws lambda delete-function "
		+ " --region " + config.aws.region
		+ " --function-name " + config.aws.function
		;

	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	console.log("About to delete our function.  Don't worry if this throws an error.");

	runCmd(cmd, function(error) {
		cb();
	});


});


//
// Upload our zipfile
//
gulp.task("upload", ["zip", "delete"], function(cb) {

	var cmd = "aws lambda create-function "
		+ " --region " + config.aws.region
		+ " --function-name " + config.aws.function
		+ " --zip-file fileb://dist/copyFileFromS3.zip "
		+ " --role " + config.aws.role
		+ " --handler " + "copyFileFromS3" + ".handler "
		+ " --runtime nodejs4.3 "
		+ " --timeout " + config.aws.timeout
		+ " --memory-size " + config.aws.memory
		;
	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	runCmd(cmd, function(error) {
		cb(error);
	});


});


//
// Test our function out
//
gulp.task("test", function(cb) {

	var cmd = "aws lambda invoke "
		//+ " --invocation-type RequestResponse "
		+ " --invocation-type Event "
		+ " --region " + config.aws.region
		+ " --function-name " + config.aws.function
		+ " --payload file://test/input.txt "
		+ "output.txt"
		;
	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	runCmd(cmd, function(error) {

		if (!error) {
			console.log("# ");
			console.log("# Results written to output.txt");
			console.log("# ");
		}

		cb(error);
	});


});



//
// Allow actions in the source S3 bucket to trigger our Lamba function
//
gulp.task("add-permission", ["upload", "remove-permission"], function(cb) {

	var cmd = "aws lambda add-permission "
		+ " --region " + config.aws.region
		+ " --function-name " + config.aws.function
		+ " --action \"lambda:InvokeFunction\" "
		+ " --principal s3.amazonaws.com "
		+ " --statement-id " + config.aws.statement_id
		+ " --source-arn arn:aws:s3:::" + config.aws.s3.src
		+ " --source-account " + config.aws.source_account
		;
	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	runCmd(cmd, function(error) {
		cb(error);
	});

});


gulp.task("remove-permission", function(cb) {

	var cmd = "aws lambda remove-permission "
		+ " --function-name " + config.aws.function
		+ " --statement-id " + config.aws.statement_id
		;
	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	runCmd(cmd, function(error) {
		cb();
	});

});


//
// Add permissions to our Lambda function
//
gulp.task("get-policy", function(cb) {

	var cmd = "aws lambda get-policy "
		+ " --function-name " + config.aws.function
		;
	if (config.cli.profile) {
		cmd += " --profile " + config.cli.profile
	}

	runCmd(cmd, function(error) {
		cb(error);
	});

});




