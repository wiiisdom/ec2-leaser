import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import AWS from "aws-sdk";

export const list: APIGatewayProxyHandlerV2 = async () => {
  try {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION as string });
    const { Items } = await documentClient
      .query({
        TableName: process.env.TABLE_NAME as string,
        KeyConditionExpression: "PK = :PK",
        ExpressionAttributeValues: { ":PK": "costcenters" },
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(Items?.map((item) => ({ name: item.SK, description: item.description }))),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error),
    };
  }
};
