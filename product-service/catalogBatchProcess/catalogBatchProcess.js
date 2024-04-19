'use strict';
const AWS = require("aws-sdk");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { BatchWriteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
  region: process.env.REGION
});
const docClient = DynamoDBDocumentClient.from(client);


const getPutRequests = (Item) => ({
  PutRequest: {
    Item
  }
})

const catalogBatchProcess = async (event) => {
  const newProducts = event?.Records.map(({ body }) => JSON.parse(body));
  let statusCode = 200;
  const importResults = {
    status: 'ok',
    errorMessages: [],
    imported: 0,
    ignored: 0,
  };

  if (newProducts && newProducts.length) {

    try {
      const [productsPutRequest, stockPutRequest] = [
        process.env.PRODUCTS_TABLE,
        process.env.STOCK_TABLE
      ].map(tableName => ({
        tableName,
        commands: []
      }))

      newProducts.forEach(({
        title,
        description,
        price,
        imageUrl,
        count,
      }) => {
        const productUuid = uuidv4();

        productsPutRequest.commands.push(getPutRequests({
          id: productUuid,
          title,
          description,
          price,
          imageUrl,
        }));

        stockPutRequest.commands.push(getPutRequests({
          product_id: productUuid,
          count
        }));
      })

      const requests = [productsPutRequest, stockPutRequest].map(
        ({ tableName, commands }) => docClient.send(new BatchWriteCommand({
          RequestItems: {
            [tableName]: commands,
          },
        })))

     await Promise.all(requests);
      const sns = new AWS.SNS({ region: 'eu-west-1' })
      await sns.publish({
        Subject: 'Products import was finished',
        Message: 'Products import was finished',
        TopicArn: process.env.SNS_ARN
      }).promise()

    } catch (err) {
      console.log(err)
      statusCode = 500;
      importResults.status = err.message;
    }
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH, PUT',
    },
    body: JSON.stringify({ statusCode, importResults, }),
  }
};
module.exports.catalogBatchProcess = catalogBatchProcess;