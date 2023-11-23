import { handler } from 'src/handlers/cron/terminate-instances';
import { it, expect, describe } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';

import {
  DescribeInstancesCommand,
  EC2Client,
  TerminateInstancesCommand,
} from '@aws-sdk/client-ec2';

describe('terminate instances', () => {
  it('handler must terminate old instance only', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: '1',
              LaunchTime: new Date(),
            },
            {
              InstanceId: '2',
            },
            {
              InstanceId: '3',
              LaunchTime: new Date('1970-01-01'),
            },
            {
              InstanceId: '4',
              LaunchTime: new Date('1975-01-01'),
            },
          ],
        },
      ],
    });
    ec2ClientMock.on(TerminateInstancesCommand).resolves({
      TerminatingInstances: [
        {
          InstanceId: 'id',
        },
      ],
    });

    const result = await handler();
    expect(result).toBe('2 instances terminated.');
    expect(ec2ClientMock.commandCalls(DescribeInstancesCommand).length).toBe(1);
    expect(ec2ClientMock.commandCalls(TerminateInstancesCommand).length).toBe(2);
  });

  it('handler throw an error if aws error', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).rejects('AWS error');
    await expect(handler).rejects.toThrowError();
  });
});
