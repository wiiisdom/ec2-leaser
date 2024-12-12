import { mockClient } from 'aws-sdk-client-mock';

import {
  CreateReplaceRootVolumeTaskCommand,
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeLaunchTemplatesCommand,
  DescribeLaunchTemplateVersionsCommand,
  DescribeSnapshotsCommand,
  EC2Client,
  RunInstancesCommand
} from '@aws-sdk/client-ec2';
import {
  getLaunchTemplateLastVersionDescription,
  listLaunchTemplates,
  replaceInstanceRootVolume,
  snapshotInstance,
  startInstance
} from '@/lib/ec2Utils';
import { expect, it } from 'vitest';

const ec2ClientMock = mockClient(EC2Client);

it('listLaunchTemplates must return a launch template list', async () => {
  ec2ClientMock.on(DescribeLaunchTemplatesCommand).resolves({
    LaunchTemplates: [
      {
        LaunchTemplateId: 'id',
        LaunchTemplateName: 'name',
        LatestVersionNumber: 1
      }
    ]
  });
  const result = await listLaunchTemplates();
  expect(result).toStrictEqual([
    {
      id: 'id',
      name: 'name',
      version: 1
    }
  ]);
});

it('getLaunchTemplateLastVersionDescription must return a launch template description', async () => {
  ec2ClientMock.on(DescribeLaunchTemplateVersionsCommand).resolves({
    LaunchTemplateVersions: [
      {
        LaunchTemplateId: 'id',
        VersionDescription: 'description'
      }
    ]
  });

  const result =
    await getLaunchTemplateLastVersionDescription('launchTemplateId');
  expect(result).toBe('description');
});

it('startInstance must return an instance', async () => {
  ec2ClientMock.on(RunInstancesCommand).resolves({
    Instances: [
      {
        InstanceId: 'instanceId',
        PrivateIpAddress: 'privateIpAddress'
      }
    ]
  });

  const result = await startInstance({
    launchTemplateId: 'launchTemplateId',
    costCenter: 'costCenter',
    owner: 'owner',
    schedule: 'schedule',
    title: 'title'
  });

  expect(result).toStrictEqual({
    InstanceId: 'instanceId',
    PrivateIpAddress: 'privateIpAddress'
  });
});

it('replaceRootVolume must fail if bad instanceId is provided', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: []
      }
    ]
  });

  await expect(() =>
    replaceInstanceRootVolume('instanceId')
  ).rejects.toThrowError('find the instance');
});

it('replaceRootVolume must fail if no snapshot available', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: [
          {
            InstanceId: 'instanceId',
            BlockDeviceMappings: []
          }
        ]
      }
    ]
  });

  ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
    Snapshots: []
  });

  await expect(() =>
    replaceInstanceRootVolume('instanceId')
  ).rejects.toThrowError('No snapshot available for instance instanceId');
});

it('replaceRootVolume must fail if error during CreateReplaceRootVolumeTaskCommand', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: [
          {
            InstanceId: 'instanceId',
            BlockDeviceMappings: []
          }
        ]
      }
    ]
  });

  ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
    Snapshots: [
      {
        SnapshotId: 'snapshotId'
      }
    ]
  });

  ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).rejects('AWS error');

  await expect(() =>
    replaceInstanceRootVolume('instanceId')
  ).rejects.toThrowError('AWS error');
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
              { Key: 'aws:something', Value: 'instanceId' }
            ],
            BlockDeviceMappings: []
          }
        ]
      }
    ]
  });

  ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
    Snapshots: [
      {
        SnapshotId: 'snapshotId'
      }
    ]
  });

  ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).resolves({
    ReplaceRootVolumeTask: {
      InstanceId: 'instanceId'
    }
  });

  const result = await replaceInstanceRootVolume('instanceId');

  expect(
    ec2ClientMock.commandCalls(CreateReplaceRootVolumeTaskCommand)[0].firstArg
      .input.TagSpecifications
  ).toStrictEqual([
    { ResourceType: 'volume', Tags: [{ Key: 'Name', Value: 'instanceId' }] }
  ]);

  expect(result).toStrictEqual({
    ReplaceRootVolumeTask: {
      InstanceId: 'instanceId'
    }
  });
});

it('snapshot must fail if bad instanceId is provided', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: []
      }
    ]
  });

  await expect(() => snapshotInstance('instanceId')).rejects.toThrowError(
    'find the instance'
  );
});

it('snapshot must fail if no EBS volume', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: [
          {
            InstanceId: 'instanceId',
            BlockDeviceMappings: []
          }
        ]
      }
    ]
  });

  await expect(() => snapshotInstance('instanceId')).rejects.toThrowError(
    "Can't find the instance EBS"
  );
});

it('snapshot must fail if more than one EBS', async () => {
  const ec2ClientMock = mockClient(EC2Client);
  ec2ClientMock.on(DescribeInstancesCommand).resolves({
    Reservations: [
      {
        Instances: [
          {
            InstanceId: 'instanceId',
            BlockDeviceMappings: [
              {
                DeviceName: '/dev/sda1'
              },
              {
                DeviceName: '/dev/sda2'
              }
            ]
          }
        ]
      }
    ]
  });

  await expect(() => snapshotInstance('instanceId')).rejects.toThrowError(
    'Cannot snapshot an instance with more than a single EBS volume'
  );
});

it('snapshot must fail if no EBS volume Id', async () => {
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
                Ebs: {}
              }
            ]
          }
        ]
      }
    ]
  });

  await expect(() => snapshotInstance('instanceId')).rejects.toThrowError(
    'Cannot find the volumeId'
  );
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
                  VolumeId: 'volumeId'
                }
              }
            ]
          }
        ]
      }
    ]
  });

  ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
    Snapshots: [
      {
        SnapshotId: 'snapshotIdOld'
      }
    ]
  });

  await snapshotInstance('instanceId');

  const deleteCalls = ec2ClientMock.commandCalls(DeleteSnapshotCommand);
  expect(deleteCalls.length).toBe(1);
  expect(deleteCalls[0].args[0].input.SnapshotId).toBe('snapshotIdOld');

  const createCalls = ec2ClientMock.commandCalls(CreateSnapshotCommand);
  expect(createCalls.length).toBe(1);
  expect(createCalls[0].args[0].input.VolumeId).toBe('volumeId');
  expect(createCalls[0].args[0].input.Description).toBe('ec2-tools-instanceId');
  expect(createCalls[0].args[0].input.TagSpecifications![0]!.Tags!.length).toBe(
    2
  );
});
