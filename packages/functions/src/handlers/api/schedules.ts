import { Table } from 'sst/node/table';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { SecureHandler } from 'src/utils/handlerUtils';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocument.from(client);

export const handler = SecureHandler(async () => {
  try {
    const { Items } = await ddbDocClient.query({
      TableName: Table.config.tableName,
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: { ':PK': 'schedules' },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(Items?.map(item => ({ name: item.SK, description: item.description }))),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: (error as Error).message,
    };
  }
});
