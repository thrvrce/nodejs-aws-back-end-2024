const AWS = require("aws-sdk");
const csv = require("csv-parser");

const { CATALOG_ITEMS_QUEUE } = process.env;
const BUCKET = "task-5-uploaded";
const IMPORT_FOLDER = "uploaded/";

const importProductsFile = async (event) => {
  const { name: filename = "" } = event.queryStringParameters;
  const s3 = new AWS.S3({ region: "eu-west-1" });
  let status = 200;
  const params = {
    Bucket: BUCKET,
    Key: `${IMPORT_FOLDER}${filename}`,
    Expires: 60,
    ContentType: "text/csv",
  };
  let signedUrl = "";

  try {
    signedUrl = await s3.getSignedUrlPromise("putObject", params);
  } catch (error) {
    console.error(error);
    status = 500;
  }

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PATCH, PUT",
    },
    body: JSON.stringify(signedUrl),
  };
};

const importFileParser = async (event) => {
  const s3 = new AWS.S3({ region: "eu-west-1" });
  const sqs = new AWS.SQS();
  let statusCode = 200;

  try {
    const streams = [];

    event.Records.forEach((record) => {
      const s3Stream = s3
        .getObject({
          Bucket: BUCKET,
          Key: record.s3.object.key,
        }).createReadStream();

      const streamPromise = new Promise((resolve, reject) => {
        s3Stream
          .pipe(csv())
          .on("data", async (data) => {

            try {
              await sqs.sendMessage({
                QueueUrl: CATALOG_ITEMS_QUEUE,
                MessageBody: JSON.stringify(data),
              }).promise();
            } catch (err) {
              console.log(err)
              throw err
            }

          })
          .on("end", async () => {
            console.log(`Copy from ${BUCKET}/${record.s3.object.key}`);
            await s3
              .copyObject({
                Bucket: BUCKET,
                CopySource: BUCKET + "/" + record.s3.object.key,
                Key: record.s3.object.key.replace("uploaded", "parsed"),
              })
              .promise();
            console.log(`Copied into ${BUCKET}/${record.s3.object.key.replace("uploaded", "parsed")}`);
            await s3.deleteObject({
              Bucket: BUCKET,
              Key: record.s3.object.key,
            }).promise();
            resolve();
          })
          .on("error", async (error) => { console.log(`error: ${error} \n`); reject(error) })
      });
      streams.push(streamPromise);
    });
    await Promise.all(streams);
  } catch (error) {
    console.error(error);
    statusCode = 500;
  }
  return { statusCode };
};

module.exports = {
  importProductsFile,
  importFileParser,
};