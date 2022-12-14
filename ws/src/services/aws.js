const AWS = require("aws-sdk");

/* A module that exports the functions `uploadToS3` and `deleteFileS3` */
module.exports = {
  IAM_USER_KEY: "AKIA5I2GCFQV4FQUGUY3",
  IAM_USER_SECRET: "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",
  BUCKET_NAME: "salao-namao-martorelli",
  AWS_REGION: "us-east-1",
  uploadToS3: function (file, filename, acl = "public-read") {
    return new Promise((resolve, reject) => {
      let IAM_USER_KEY = this.IAM_USER_KEY;
      let IAM_USER_SECRET = this.IAM_USER_SECRET;
      let BUCKET_NAME = this.BUCKET_NAME;

      let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME,
      });

      s3bucket.createBucket(function () {
        var params = {
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: file.data,
          ACL: acl,
        };

        s3bucket.upload(params, function (err, data) {
          if (err) {
            console.log(err);
            return resolve({ error: true, message: err });
          }
          console.log(data);
          return resolve({ error: false, message: data });
        });
      });
    });
  },
  deleteFileS3: function (key) {
    return new Promise((resolve, reject) => {
      let IAM_USER_KEY = this.IAM_USER_KEY;
      let IAM_USER_SECRET = this.IAM_USER_SECRET;
      let BUCKET_NAME = this.BUCKET_NAME;

      let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME,
      });

      s3bucket.createBucket(function () {
        s3bucket.deleteObject(
          {
            Bucket: BUCKET_NAME,
            Key: key,
          },
          function (err, data) {
            if (err) {
              console.log(err);
              return resolve({ error: true, message: err.message });
            }
            console.log(data);
            return resolve({ error: false, message: data });
          }
        );
      });
    });
  },
};
