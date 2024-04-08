const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { BatchWriteCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');
const { products } = require('./mockProducts.json')
require('dotenv').config()

const client = new DynamoDBClient({
  region: process.env.REGION
});
const docClient = DynamoDBDocumentClient.from(client);
const [productsPutRequest, stockPutRequest] = [
  process.env.PRODUCTS_TABLE,
  process.env.STOCK_TABLE
].map(tableName => ({
  tableName,
  commands: []
}))

const getPutRequests = (Item) => ({
  PutRequest: {
    Item
  }
})

const main = async () => {
  try {
    products.forEach(({
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

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      console.log(response)
    })
  } catch (error) {
    console.error(error);
    throw new Error('Error during data import', { cause: error });
  }
}

main();