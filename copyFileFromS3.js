/**
* This script will run as an AWS Lambda function and should be fired when 
*/

//
// Load our required modules
//
var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');


// Create our S3 client. No credentials will be necessary as this code will run under a role.
var s3 = new AWS.S3();
 

exports.handler = function(event, context, cb) {

	console.log(util.inspect(event, {depth: 5}));
    
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
	var dstBucket = "dmuth-test-dest";
	var dstKey    = srcKey;

	if (srcBucket == dstBucket) {
		cb("Source and destination buckets are the same.");
		return;
	}

	//
	// Download the image from S3, upload to a different S3 bucket.
	//
	var src = srcBucket + "/" + srcKey;
	var dest = dstBucket + "/" + dstKey;

	async.waterfall([

		function download(cb2) {

			console.log("About to copy source file:", src);

			s3.getObject({
				Bucket: srcBucket,
				Key: srcKey
				}, cb2);

		},

		function upload(response, cb2) {

			console.log("Successfully grabbed source file! About to write dest file:", dest);

			s3.putObject({
				Bucket: dstBucket,
				Key: dstKey,
				Body: response.Body,
				ContentType: response.ContentType
			}, cb2);

		}

	], function (error) {

		if (error) {
			console.error(util.format("Unable to copy %s to %s. Error: %s", src, dest, error));

		} else {
			console.log(util.format("Successfully copied %s to %s", src, dest));

		}

		cb(null, "message");
        
	}

)};



