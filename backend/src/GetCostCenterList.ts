import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import AWS from "aws-sdk";

export const list: APIGatewayProxyHandlerV2 = async () => {
  try {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
    const data = await documentClient
      .scan({ TableName: process.env.TABLE_NAME as string, Select: "ALL_ATTRIBUTES" })
      .promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error),
    };
  }
};
