import { handler } from 'src/handlers/api/list-templates';
import { it, expect, describe, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'vitest-mock-extended';

vi.mock('src/utils/authUtils');

import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { DescribeLaunchTemplatesCommand, EC2Client } from '@aws-sdk/client-ec2';

describe('launch templates list', () => {
  it('handler must return a launch template list', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeLaunchTemplatesCommand).resolves({
      LaunchTemplates: [
        {
          LaunchTemplateId: 'id',
          LaunchTemplateName: 'name',
          LatestVersionNumber: 1,
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
          id: 'id',
          name: 'name',
          version: 1,
        },
      ])
    );
  });

  it('handler must return a error if error on AWS call', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeLaunchTemplatesCommand).rejects('AWS error');
    const event = mock<APIGatewayProxyEventV2>();
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('AWS error');
  });
});
