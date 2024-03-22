import { handler } from 'src/handlers/api/start-instance';
import { it, expect, describe, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'vitest-mock-extended';

import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { EC2Client, RunInstancesCommand } from '@aws-sdk/client-ec2';

vi.mock('src/utils/authUtils');

describe('start instance', () => {
  it('handler must start instance', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(RunInstancesCommand).resolves({
      Instances: [
        {
          InstanceId: 'id',
          PrivateIpAddress: '1.1.1.1',
        },
      ],
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
      owner: 'owner',
      costCenter: 'costCenter',
      schedule: 'schedule',
      title: 'title',
    });

    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual(
      JSON.stringify({
        instanceId: 'id',
        privateIp: '1.1.1.1',
      })
    );
  });

  it('handler must return a error if no body', async () => {
    const event = mock<APIGatewayProxyEventV2>();
    event.body = undefined;
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('Missing parameters');
  });
  it('handler must return a error if aws error', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(RunInstancesCommand).rejects('AWS error');
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
    });
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('AWS error');
  });
  it('handler must return a error if no instance in result', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(RunInstancesCommand).resolves({
      Instances: [],
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
    });
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('Wrong result from the EC2 API');
  });
});
