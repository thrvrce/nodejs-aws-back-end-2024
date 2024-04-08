'use strict';

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.REGION
});
const docClient = DynamoDBDocumentClient.from(client);

const getTableItem = async (table, keyConfig) => {
  const command = new GetCommand({
    TableName: table,
    Key: keyConfig
  });

  const response = await docClient.send(command);
  return response;
};

const getProductsById = async (event) => {
  let result;
  let statusCode = 200;
  let {
    resource = '',
    path = '',
    httpMethod = '',
    queryStringParameters = {},
    pathParameters = ''
  } = event;
  let message = 'ok';
  const { productId = '' } = event.pathParameters ?? {};
  console.log({ resource, path, httpMethod, queryStringParameters, productId });

  try {
    if (productId) {
      const [
        { Item: product },
        { Item: stock }
      ] = await Promise.all([
        getTableItem(process.env.PRODUCTS_TABLE, { id: productId }),
        getTableItem(process.env.STOCK_TABLE, { product_id: productId })
      ]);

      if (!product) {
        statusCode = 400;
        message = 'product was not found';
      }

      result = { ...product, stock: stock?.count ?? 0 };
    } else {
      statusCode = 400;
      message = 'product id is empty';
    }
  } catch (err) {
    statusCode = 500;
    message = err.message;
  }
  finally {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      statusCode,
      body: JSON.stringify(statusCode === 200 ? result : message),
    }
  }
};

module.exports.getProductsById = getProductsById;
