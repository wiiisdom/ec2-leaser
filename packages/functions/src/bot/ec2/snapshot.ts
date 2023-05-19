import {
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client
} from "@aws-sdk/client-ec2";
import { Ec2ToolError } from "../../errors";

const client = new EC2Client({});

export const snapshotInstance = async (instanceId: string) => {
  // get instance detail to get EBS to snapshot
  const response = await client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    })
  );

  const instance = response.Reservations?.[0]?.Instances?.[0];
  const blockDeviceMappings = instance?.BlockDeviceMappings;

  if (!instance || !blockDeviceMappings || blockDeviceMappings.length === 0) {
    throw new Ec2ToolError("Can't find the instance EBS");
  }

  if (blockDeviceMappings.length > 1) {
    throw new Ec2ToolError(
      "Cannot snapshot an instance with more than a single EBS volume"
    );
  }
  // for each EBS of the instance, generate a snapshot
  const volumeId = blockDeviceMappings[0].Ebs?.VolumeId;

  if (!volumeId) {
    throw new Ec2ToolError("Cannot find the volumeId");
  }

  return updateEBSSnapshot(instanceId, volumeId);
};

const updateEBSSnapshot = async (instanceId: string, volumeId: string) => {
  // check if snapshot exist
  const response = await client.send(
    new DescribeSnapshotsCommand({
      Filters: [
        {
          Name: "description",
          Values: [`ec2-tools-${instanceId}`]
        }
      ]
    })
  );

  if (response.Snapshots && response.Snapshots.length > 0) {
    // if yes then delete it
    for (const snapshot of response.Snapshots) {
      await client.send(
        new DeleteSnapshotCommand({
          SnapshotId: snapshot.SnapshotId
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
          ResourceType: "snapshot",
          Tags: [
            { Key: "costcenter", Value: "eng:lab" },
            { Key: "project", Value: "ec2-tools" }
          ]
        }
      ]
    })
  );
};
