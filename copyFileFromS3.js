/**
* This script will run as an AWS Lambda function and should be fired when 
*/

//
// Load our required modules
//
var async = require("async");
var AWS = require("aws-sdk");

process.env.NODE_CONFIG_DIR = process.env["LAMBDA_TASK_ROOT"];
var config = require("config");

var util = require("util");


//
// Create our S3 client. No credentials will be necessary as this code will run under a role.
//
var s3 = new AWS.S3();


/**
* Read our source file and write it to a new bucket.
*/
function copyFile(srcBucket, srcKey, dstBucket, dstKey, cb) {

	async.waterfall([
		function download(cb2) {

			console.log("About to copy source: " + srcBucket + "/" + srcKey);

			s3.getObject({
				Bucket: srcBucket,
				Key: srcKey
				}, cb2);

		},

		function upload(response, cb2) {

			console.log("Successfully grabbed source file! About to write dest file: " 
				+ dstBucket + "/" + dstKey);

			s3.putObject({
				Bucket: dstBucket,
				Key: dstKey,
				Body: response.Body,
				ContentType: response.ContentType
			}, cb2);

		}
		],
		function(error) {
			cb(error);

		});

} // End of copyFile()



exports.handler = function(event, context, cb) {

	console.log("Event data: " + util.inspect(event, {depth: 5}));
    
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
	var dstBucket = config.aws.s3.dest;
	var dstKey    = srcKey;
	//var dstKey    = srcKey + "-" + new Date().getTime(); // Debugging

	if (srcBucket == dstBucket) {
		cb("Source and destination buckets are the same.");
		return;
	}

	//
	// Download the image from S3, upload to a different S3 bucket.
	//
	var src = srcBucket + "/" + srcKey;
	var dest = dstBucket + "/" + dstKey;
	console.log(util.format("About to copy file '%s' to '%s'", src, dest));

	async.waterfall([

		function(cb2) {
			copyFile(srcBucket, srcKey, dstBucket, dstKey, cb2);
		},

	], function (error) {

		if (error) {
			console.error(util.format("ERROR: Unable to copy %s to %s. Error: %s", src, dest, error));

		} else {
			console.log(util.format("OK: Successfully copied %s to %s", src, dest));

		}

		cb(null, "message");
        
	}

)};



