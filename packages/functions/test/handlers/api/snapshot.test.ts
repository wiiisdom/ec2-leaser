import { handler, snapshot } from 'src/handlers/api/snapshot';
import { it, expect, describe } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { mock } from 'vitest-mock-extended';

describe('ec2 snapshot', () => {
  it('handler must fail if no instanceId', async () => {
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({});
    event.isBase64Encoded = false;
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('Missing instanceId');
  });
  it('handler must pass if instanceId', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              BlockDeviceMappings: [
                {
                  Ebs: {
                    VolumeId: 'volumeId',
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [],
    });
    ec2ClientMock.on(CreateSnapshotCommand).resolves({
      SnapshotId: 'snapshotId',
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'instanceId',
    });
    event.isBase64Encoded = false;
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual('snapshotId');
  });
  it('snapshot must fail if bad instanceId is provided', () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [],
        },
      ],
    });

    expect(() => snapshot('instanceId')).rejects.toThrowError('find the instance');
  });

  it('snapshot must fail if no EBS volume', () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              BlockDeviceMappings: [],
            },
          ],
        },
      ],
    });

    expect(() => snapshot('instanceId')).rejects.toThrowError("Can't find the instance EBS");
  });

  it('snapshot must fail if more than one EBS', () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              BlockDeviceMappings: [
                {
                  DeviceName: '/dev/sda1',
                },
                {
                  DeviceName: '/dev/sda2',
                },
              ],
            },
          ],
        },
      ],
    });

    expect(() => snapshot('instanceId')).rejects.toThrowError(
      'Cannot snapshot an instance with more than a single EBS volume'
    );
  });

  it('snapshot must fail if no EBS volume Id', () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              BlockDeviceMappings: [
                {
                  DeviceName: '/dev/sda1',
                  Ebs: {},
                },
              ],
            },
          ],
        },
      ],
    });

    expect(() => snapshot('instanceId')).rejects.toThrowError('Cannot find the volumeId');
  });

  it('snapshot must delete EBS snapshot if found one, then create a new one', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              BlockDeviceMappings: [
                {
                  Ebs: {
                    VolumeId: 'volumeId',
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: 'snapshotIdOld',
        },
      ],
    });

    await snapshot('instanceId');

    const deleteCalls = ec2ClientMock.commandCalls(DeleteSnapshotCommand);
    expect(deleteCalls.length).toBe(1);
    expect(deleteCalls[0].args[0].input.SnapshotId).toBe('snapshotIdOld');

    const createCalls = ec2ClientMock.commandCalls(CreateSnapshotCommand);
    expect(createCalls.length).toBe(1);
    expect(createCalls[0].args[0].input.VolumeId).toBe('volumeId');
    expect(createCalls[0].args[0].input.Description).toBe('ec2-tools-instanceId');
    expect(createCalls[0].args[0].input.TagSpecifications![0]!.Tags!.length).toBe(2);
  });
});
