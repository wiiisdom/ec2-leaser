import { Table } from 'sst/node/table';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiHandler } from 'sst/node/api';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = ApiHandler(async () => {
  try {
    const { Items } = await ddbDocClient.send(
      new QueryCommand({
        TableName: Table.config.tableName,
        KeyConditionExpression: 'PK = :PK',
        ExpressionAttributeValues: { ':PK': 'costcenters' },
      })
    );

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
