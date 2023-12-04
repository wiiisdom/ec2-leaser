import {
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client,
} from '@aws-sdk/client-ec2';
import { Ec2ToolError } from 'src/errors';
import { SecureHandler } from 'src/utils/handlerUtils';
import { useJsonBody } from 'sst/node/api';

const client = new EC2Client({});

export const handler = SecureHandler(async evt => {
  const data = useJsonBody();
  try {
    const instanceId = data.instanceId;
    if (!instanceId) {
      throw new Ec2ToolError('Missing instanceId');
    }

    const ebsSnapshot = await snapshot(instanceId);

    return {
      statusCode: 200,
      body: ebsSnapshot.SnapshotId,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        statusCode: 500,
        body: err.message,
      };
    } else {
      return {
        statusCode: 500,
        body: 'Unknown error',
      };
    }
  }
});

export const snapshot = async (instanceId: string) => {
  // get instance detail to get EBS to snapshot
  const response = await client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    })
  );

  const instance = response.Reservations?.[0]?.Instances?.[0];
  const blockDeviceMappings = instance?.BlockDeviceMappings;

  if (!instance || !blockDeviceMappings || blockDeviceMappings.length === 0) {
    throw new Ec2ToolError("Can't find the instance EBS");
  }

  if (blockDeviceMappings.length > 1) {
    throw new Ec2ToolError('Cannot snapshot an instance with more than a single EBS volume');
  }
  // for each EBS of the instance, generate a snapshot
  const volumeId = blockDeviceMappings[0].Ebs?.VolumeId;

  if (!volumeId) {
    throw new Ec2ToolError('Cannot find the volumeId');
  }

  return updateEBSSnapshot(instanceId, volumeId);
};

const updateEBSSnapshot = async (instanceId: string, volumeId: string) => {
  // check if snapshot exist
  const response = await client.send(
    new DescribeSnapshotsCommand({
      Filters: [
        {
          Name: 'description',
          Values: [`ec2-tools-${instanceId}`],
        },
      ],
    })
  );

  if (response.Snapshots && response.Snapshots.length > 0) {
    // if yes then delete it
    for (const snap of response.Snapshots) {
      await client.send(
        new DeleteSnapshotCommand({
          SnapshotId: snap.SnapshotId,
        })
      );
    }
  }
  // then save it
  return client.send(
    new CreateSnapshotCommand({
      VolumeId: volumeId,
      Description: `ec2-tools-${instanceId}`,
      TagSpecifications: [
        {
          ResourceType: 'snapshot',
          Tags: [
            { Key: 'costcenter', Value: 'eng:lab' },
            { Key: 'project', Value: 'ec2-tools' },
          ],
        },
      ],
    })
  );
};
