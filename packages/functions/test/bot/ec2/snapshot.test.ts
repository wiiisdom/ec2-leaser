import { snapshotInstance } from "src/bot/ec2/snapshot";
import { it, expect, describe } from "vitest";
const { mockClient } = require("aws-sdk-client-mock");
import {
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeSnapshotsCommand,
  EC2Client
} from "@aws-sdk/client-ec2";

describe("ec2 snapshot", () => {
  it("snapshotInstance must fail if bad instanceId is provided", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: []
        }
      ]
    });

    expect(() => snapshotInstance("instanceId")).rejects.toThrowError(
      "find the instance"
    );
  });

  it("snapshotInstance must fail if no EBS volume", () => {
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

    expect(() => snapshotInstance("instanceId")).rejects.toThrowError(
      "Can't find the instance EBS"
    );
  });

  it("snapshotInstance must fail if more than one EBS", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: [
                {
                  DeviceName: "/dev/sda1"
                },
                {
                  DeviceName: "/dev/sda2"
                }
              ]
            }
          ]
        }
      ]
    });

    expect(() => snapshotInstance("instanceId")).rejects.toThrowError(
      "Cannot snapshot an instance with more than a single EBS volume"
    );
  });

  it("snapshotInstance must fail if no EBS volume Id", () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: [
                {
                  DeviceName: "/dev/sda1",
                  Ebs: {}
                }
              ]
            }
          ]
        }
      ]
    });

    expect(() => snapshotInstance("instanceId")).rejects.toThrowError(
      "Cannot find the volumeId"
    );
  });

  it("snapshotInstance must delete EBS snapshot if found one, then create a new one", async () => {
    const ec2ClientMock = mockClient(EC2Client);
    ec2ClientMock.on(DescribeInstancesCommand).resolves({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: "instanceId",
              BlockDeviceMappings: [
                {
                  Ebs: {
                    VolumeId: "volumeId"
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
          SnapshotId: "snapshotIdOld"
        }
      ]
    });

    await snapshotInstance("instanceId");

    const deleteCalls = ec2ClientMock.commandCalls(DeleteSnapshotCommand);
    expect(deleteCalls.length).toBe(1);
    expect(deleteCalls[0].args[0].input.SnapshotId).toBe("snapshotIdOld");

    const createCalls = ec2ClientMock.commandCalls(CreateSnapshotCommand);
    expect(createCalls.length).toBe(1);
    expect(createCalls[0].args[0].input.VolumeId).toBe("volumeId");
    expect(createCalls[0].args[0].input.Description).toBe(
      "ec2-tools-instanceId"
    );
    expect(createCalls[0].args[0].input.TagSpecifications[0].Tags.length).toBe(
      2
    );
  });
});
