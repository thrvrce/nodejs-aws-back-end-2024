'use strict';
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
  region: process.env.REGION
});
const docClient = DynamoDBDocumentClient.from(client);

const addItem = async (tableName, itemConfig) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: itemConfig,
  });

  const response = await docClient.send(command);
  return response;
};


const createProduct = async (event) => {
  let statusCode = 200;
  let {
    resource = '',
    path = '',
    httpMethod = '',
    queryStringParameters = {},
    body
  } = event;
  let message = 'ok';

  console.log({ resource, path, httpMethod, queryStringParameters, body });

  try {
    let {
      title = '',
      description = '',
      price = '',
      imageUrl = '',
      count
    } = JSON.parse(body);


    if (title && description && price && imageUrl) {
      const productUuid = uuidv4();

      await Promise.all([
        addItem(process.env.PRODUCTS_TABLE, {
          id: productUuid,
          title,
          description,
          price,
          imageUrl,
        }),
        addItem(process.env.STOCK_TABLE, {
          product_id: productUuid,
          count: typeof count === 'number' && !isNaN(count) ? count : 0
        })
      ])
    } else {
      statusCode = 400;
      message = 'check product parameters';
    }
  } catch (err) {
    statusCode = 500;
    message = err.message;
  }
  finally {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      statusCode,
      body: JSON.stringify(message),
    }
  }
};
module.exports.createProduct = createProduct;
