const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

function createDynamoDocClient({ region } = {}) {
  const dynamoBaseClient = new DynamoDBClient(region ? { region } : {});

  return DynamoDBDocumentClient.from(dynamoBaseClient, {
    marshallOptions: {
      removeUndefinedValues: true
    }
  });
}

module.exports = {
  createDynamoDocClient
};
