import { handler } from 'src/handlers/api/describe-template';
import { it, expect, describe, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'vitest-mock-extended';

vi.mock('src/utils/authUtils');

import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { DescribeLaunchTemplateVersionsCommand, EC2Client } from '@aws-sdk/client-ec2';

describe('launch template describe', () => {
  it('handler must return a launch template', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeLaunchTemplateVersionsCommand).resolves({
      LaunchTemplateVersions: [
        {
          LaunchTemplateId: 'id',
          VersionDescription: 'description',
        },
      ],
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
    });

    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual(
      JSON.stringify({
        description: 'description',
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
    ec2ClientMock.on(DescribeLaunchTemplateVersionsCommand).rejects('AWS error');
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
    });
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('AWS error');
  });
  it('handler must return a error if no launch template version', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeLaunchTemplateVersionsCommand).resolves({
      LaunchTemplateVersions: [],
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'id',
    });
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('No Launch Template Version found');
  });
});
