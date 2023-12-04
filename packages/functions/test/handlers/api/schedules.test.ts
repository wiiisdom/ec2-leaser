import { handler } from 'src/handlers/api/schedules';
import { it, expect, describe, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'vitest-mock-extended';

import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

vi.mock('src/utils/authUtils');

describe('schedules list', () => {
  it('handler must return a schedule list', async () => {
    const ddClientMock = mockClient(DynamoDBDocumentClient);
    ddClientMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'id',
          SK: 'name',
          description: 'description',
        },
      ],
    });
    const event = mock<APIGatewayProxyEventV2>();
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual(
      JSON.stringify([
        {
          name: 'name',
          description: 'description',
        },
      ])
    );
  });

  it('handler must return a error if error on AWS call', async () => {
    const ddClientMock = mockClient(DynamoDBDocumentClient);
    ddClientMock.on(QueryCommand).rejects('AWS error');
    const event = mock<APIGatewayProxyEventV2>();
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('AWS error');
  });
});
