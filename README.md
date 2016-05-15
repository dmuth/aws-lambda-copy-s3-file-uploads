
<img src="img/aws-lambda-banner.png" width="300" align="right" />

# Copy S3 File Uploads

This is an AWS Lambda function which when fired with an S3 ObjectCreated event, will automatically copy the file
from the bucket it was created in to a target bucket.

**Suggested uses:** Useful for making sure that the contents of a bucket which many people/processes
have write access to is backed up, in case one of those processes (or people) runs amok.



## Prequistites

- The `awscli` CLI utility: http://docs.aws.amazon.com/cli/latest/userguide/installing.html
	- Make sure it is configured with AWS credentials
- Make sure <a href="http://nodejs.org/">Node.js</a> and <a href="http://gulpjs.com/">Gulp</a> are installed.


## Setup

- Create your source and target buckets in AWS.
- Create a role in IAM with the "AWSLmabdaExecute" policy, then add the "s3:CopyObject" permission.
   - ...or, just use <a href="#policy">the sample IAM policy below</a>.
   - **Note the ARN of the role**
- Copy `config/default.yaml-sample` to `config/default.yaml`, and edit the file to include
   - The credentials profile you are using in the AWS CLI
   - The ARN of the role you just created
   - Your AWS acount ID
   - Your source and destination buckets
- Run `gulp go` to create the ZIP File containing the function, upload it, and set permissions on the function.
- Go into the Lamba function on the control panel and click the "Events" tab. Add an "Object Created" source for the bucket you want to replicate. (There doesn't seem to be a way to do this on the command line.  If someone knows, please tell me!)


## Testing

You should be able to copy a file into your source bucket, and it will show up in the destination bucket.


## Troubleshooting

The first thing you can try checking if files aren't showing up are the Cloudwatch logs for that function.
Since this is asynchronous, it can sometimes take a few seconds for the file to be copied.

The next thing you can try is to run `gulp test`, which will run the Lamba function with a test event
stored in `test/input.txt`.  Note that you will need to change the source bucket and filename first.


<a name="policy"></a>
## Sample IAM Policy

Here's a sample IAM policy that will allow Lambda functions to read from S3 and copy objects within it:


```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:CopyObject"
            ],
            "Resource": "arn:aws:s3:::*"
        }
    ]
}
```


## FAQ

Q: Why is the node_modules/ directory present?

A: Because I'm a fan of <a href="https://reproducible-builds.org/">Reproducible Builds</a>. While this isn't 
strictly "compiling" software, I believe that people should be able to clone this repository and run
the exact same code which I have on my dev machine at home.  It can prevent a whole series of bugs where an 
underlying module is updated and introduces (or fixes) a bug, causing the calling code to behave differently.



## Reporting Bugs and Contacting Me

Feel free to <a href="https://github.com/dmuth/aws-lamba-copy-s3-file-uploads/issues/new"
	>file an issue</a>.  A few other ways to get in touch with me:

- Email: dmuth AT dmuth DOT org, doug.muth AT gmail dot com
- Twitter: <a href="http://twitter.com/dmuth">@dmuth</a>
- <a href="http://www.facebook.com/dmuth">Facebook</a>


Is this code is useful for your project, do let me know!



