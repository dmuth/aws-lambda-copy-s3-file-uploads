// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');


// get reference to S3 client 
var s3 = new AWS.S3();
 

exports.handler = function(event, context, cb) {

	console.log(util.inspect(event, {depth: 5}));
    
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
	var dstBucket = "aws-lambda-copy-s3-uploads-backups";
	var dstKey    = srcKey;

	if (srcBucket == dstBucket) {
		cb("Source and destination buckets are the same.");
		return;
	}

	// Download the image from S3, upload to a different S3 bucket.
	async.waterfall([

		function download(cb2) {
			s3.getObject({
				Bucket: srcBucket,
				Key: srcKey
				},
				cb2);
		},

		function upload(response, cb2) {
			s3.putObject({
				Bucket: dstBucket,
				Key: dstKey,
				Body: response.Body,
				ContentType: response.ContentType
			}, cb2);
		}

	], function (error) {

		var src = srcBucket + "/" + srcKey;
		var dest = dstBucket + "/" + dstKey;

		if (error) {
			console.error(util.format("Unable to copy %s to %s", src, dest));

		} else {
			console.log(util.format("Successfully copied %s to %s", src, dest));

		}

		cb(null, "message");
        
	}

)};



