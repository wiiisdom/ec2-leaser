import { restoreInstance } from "src/bot/ec2/restore";
import { it, expect, describe } from "vitest";
const { mockClient } = require("aws-sdk-client-mock");
import {
  CreateReplaceRootVolumeTaskCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client
} from "@aws-sdk/client-ec2";

describe("ec2 restore", () => {
  it("restoreInstance must fail if bad instanceId is provided", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: []
        }
      ]
    });

    expect(() => restoreInstance("instanceId")).rejects.toThrowError(
      "find the instance"
    );
  });

  it("restoreInstance must fail if no snapshot available", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: []
            }
          ]
        }
      ]
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: []
    });

    expect(() => restoreInstance("instanceId")).rejects.toThrowError(
      "No snapshot available for instance instanceId"
    );
  });

  it("restoreInstance must fail if error during CreateReplaceRootVolumeTaskCommand", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: []
            }
          ]
        }
      ]
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: "snapshotId"
        }
      ]
    });

    ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).rejects("AWS error");

    expect(() => restoreInstance("instanceId")).rejects.toThrowError(
      "AWS error"
    );
  });

  it("restoreInstance must success if all is good", async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: []
            }
          ]
        }
      ]
    });

    ec2ClientMock.on(DescribeSnapshotsCommand).resolves({
      Snapshots: [
        {
          SnapshotId: "snapshotId"
        }
      ]
    });

    ec2ClientMock.on(CreateReplaceRootVolumeTaskCommand).resolves({
      ReplaceRootVolumeTask: {
        InstanceId: "instanceId"
      }
    });

    const result = await restoreInstance("instanceId");

    expect(result).toStrictEqual({
      ReplaceRootVolumeTask: {
        InstanceId: "instanceId"
      }
    });
  });
});
