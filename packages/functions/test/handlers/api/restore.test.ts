import { handler, replaceRootVolume } from 'src/handlers/api/restore';
import { it, expect, describe, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'vitest-mock-extended';

vi.mock('src/utils/authUtils');

import {
  CreateReplaceRootVolumeTaskCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

describe('ec2 restore', () => {
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
              Tags: [
                { Key: 'Name', Value: 'instanceId' },
                { Key: 'aws:something', Value: 'instanceId' },
              ],
              BlockDeviceMappings: [],
            },
          ],
        },
      ],
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: 'snapshotId',
        },
      ],
    });

    ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).resolves({
      ReplaceRootVolumeTask: {
        InstanceId: 'instanceId',
      },
    });
    const event = mock<APIGatewayProxyEventV2>();
    event.body = JSON.stringify({
      instanceId: 'instanceId',
    });
    event.isBase64Encoded = false;
    const context = mock<Context>();
    const result = await handler(event, context);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual('{"instanceId":"instanceId"}');
  });
  it('replaceRootVolume must fail if bad instanceId is provided', () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [],
        },
      ],
    });

    expect(() => replaceRootVolume('instanceId')).rejects.toThrowError('find the instance');
  });

  it('replaceRootVolume must fail if no snapshot available', () => {
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

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [],
    });

    expect(() => replaceRootVolume('instanceId')).rejects.toThrowError(
      'No snapshot available for instance instanceId'
    );
  });

  it('replaceRootVolume must fail if error during CreateReplaceRootVolumeTaskCommand', () => {
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

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: 'snapshotId',
        },
      ],
    });

    ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).rejects('AWS error');

    expect(() => replaceRootVolume('instanceId')).rejects.toThrowError('AWS error');
  });

  it('replaceRootVolume must success if all is good (and filter aws: tags)', async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'instanceId',
              Tags: [
                { Key: 'Name', Value: 'instanceId' },
                { Key: 'aws:something', Value: 'instanceId' },
              ],
              BlockDeviceMappings: [],
            },
          ],
        },
      ],
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: 'snapshotId',
        },
      ],
    });

    ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).resolves({
      ReplaceRootVolumeTask: {
        InstanceId: 'instanceId',
      },
    });

    const result = await replaceRootVolume('instanceId');

    expect(
      ec2ClientMock.commandCalls(CreateReplaceRootVolumeTaskCommand)[0].firstArg.input
        .TagSpecifications
    ).toStrictEqual([{ ResourceType: 'volume', Tags: [{ Key: 'Name', Value: 'instanceId' }] }]);

    expect(result).toStrictEqual({
      ReplaceRootVolumeTask: {
        InstanceId: 'instanceId',
      },
    });
  });
});
