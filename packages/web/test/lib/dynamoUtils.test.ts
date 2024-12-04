import { it, expect } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getCostCenters, getSchedules } from '@/lib/dynamoUtils';

const ddClientMock = mockClient(DynamoDBDocumentClient);

it('getCostCenters must return a cost center list', async () => {
  ddClientMock.on(QueryCommand).resolves({
    Items: [
      {
        PK: 'id',
        SK: 'costcenter',
        description: 'description'
      }
    ]
  });
  const result = await getCostCenters();
  expect(result).toStrictEqual([
    {
      name: 'costcenter',
      description: 'description'
    }
  ]);
});

it('getSchedules must return a schedule list', async () => {
  ddClientMock.on(QueryCommand).resolves({
    Items: [
      {
        PK: 'id',
        SK: 'schedule',
        description: 'description'
      }
    ]
  });
  const result = await getSchedules();
  expect(result).toStrictEqual([
    {
      name: 'schedule',
      description: 'description'
    }
  ]);
});
