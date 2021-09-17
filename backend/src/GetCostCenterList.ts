import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import AWS from "aws-sdk";

const CONST_CENTER_LIST = {
  eng: "Generic Engineering usage",
  "eng:360wp": "Usage for Engineering 360WebPlatform",
  "eng:360eyes": "Usage for Engineering 360Eyes",
  "eng:cockpit": "Usage for Engineering Cockpit project",
  "eng:lab": "Usage for Engineering Lab team",
  "eng:wopbi": "Usage for Wiiisdom Ops for Power BI project",
  "eng:kinesis": "Usage for Engineering Kinesis-CI Project",
  "presales:360": "Resources used for presales on 360products",
  "presales:kinesis": "Resources used for presales on Kinesis-CI",
  it: "Usage for general IT resources",
  support: "Usage for Support Team",
};
const TABLE_ARN = "arn:aws:dynamodb:us-east-1:126096613559:table/cost_center_list";
const TABLE_NAME = "cost_center_list";

export const start: APIGatewayProxyHandlerV2 = async () => {
  try {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });
    const data = await documentClient.scan({ TableName: TABLE_NAME, Select: "ALL_ATTRIBUTES" }).promise();
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
