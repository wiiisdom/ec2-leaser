import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getCostCenters = async () => {
  const { Items } = await ddbDocClient.send(
    new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: { ':PK': 'costcenters' }
    })
  );

  return Items?.map(item => ({ name: item.SK, description: item.description }));
};

export const getSchedules = async () => {
  const { Items } = await ddbDocClient.send(
    new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: { ':PK': 'schedules' }
    })
  );

  return Items?.map(item => ({ name: item.SK, description: item.description }));
};
