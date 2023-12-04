import {
  CreateReplaceRootVolumeTaskCommand,
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

    const commandResult = await replaceRootVolume(instanceId);

    return {
      statusCode: 200,
      body: commandResult.ReplaceRootVolumeTask?.InstanceId,
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

export const replaceRootVolume = async (instanceId: string) => {
  // get instance detail to get EBS to snapshot
  const response = await client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    })
  );

  const instance = response.Reservations?.[0]?.Instances?.[0];
  const blockDeviceMappings = instance?.BlockDeviceMappings;

  if (!instance || !blockDeviceMappings) {
    throw new Ec2ToolError("Can't find the instance EBS");
  }

  // check if snapshot exist
  const snapshotResponse = await client.send(
    new DescribeSnapshotsCommand({
      Filters: [
        {
          Name: 'description',
          Values: [`ec2-tools-${instance.InstanceId}`],
        },
      ],
    })
  );

  // check if snapshot available!
  if (!snapshotResponse.Snapshots || snapshotResponse.Snapshots.length === 0) {
    throw new Ec2ToolError(`No snapshot available for instance ${instance.InstanceId}.`);
  }

  // then launch the root volume replacement
  return client.send(
    new CreateReplaceRootVolumeTaskCommand({
      InstanceId: instance.InstanceId,
      SnapshotId: snapshotResponse.Snapshots[0].SnapshotId,
      DeleteReplacedRootVolume: true,
      TagSpecifications: [
        {
          ResourceType: 'volume',
          Tags: instance.Tags?.filter(tag => !tag.Key?.startsWith('aws:')),
        },
      ],
    })
  );
};
