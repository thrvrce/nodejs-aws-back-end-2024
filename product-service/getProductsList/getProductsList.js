'use strict';
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const client = new DynamoDBClient({
  region: process.env.REGION
});
const docClient = DynamoDBDocumentClient.from(client);

const scanTable = async (tableName) => {
  const command = new ScanCommand({
    TableName: tableName,
  });

  const response = await docClient.send(command);

  return response;
};

const getProductsList = async (event) => {
  let result = [];
  let statusCode = 200;
  let {
    resource = '',
    path = '',
    httpMethod=  '',
    queryStringParameters = {}
  } = event;
  let message = 'ok';
  console.log({ resource, path, httpMethod, queryStringParameters});

  try {
    const [
      { Items: products },
      { Items: stock }
    ] = await Promise.all([
      scanTable(process.env.PRODUCTS_TABLE),
      scanTable(process.env.STOCK_TABLE)
    ]);
    result = products?.map(product => ({
      ...product,
      count: stock?.find(({ product_id }) => product_id === product.id)?.count ?? 0
    }))
  } catch (err) {
    message = err.message;
    statusCode = 500;
  }
  finally {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      statusCode,
      body: JSON.stringify(statusCode === 200 ? result : message),
    }
  }
};

module.exports.getProductsList = getProductsList;
