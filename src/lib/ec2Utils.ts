import {
  CreateReplaceRootVolumeTaskCommand,
  CreateSnapshotCommand,
  DeleteSnapshotCommand,
  DescribeInstancesCommand,
  DescribeLaunchTemplatesCommand,
  DescribeLaunchTemplateVersionsCommand,
  DescribeSnapshotsCommand,
  EC2Client,
  RunInstancesCommand,
  RunInstancesCommandInput
} from '@aws-sdk/client-ec2';

const client = new EC2Client({});

export const listLaunchTemplates = async () => {
  const result = await client.send(
    new DescribeLaunchTemplatesCommand({
      Filters: [
        {
          Name: 'tag:Ec2Leaser',
          Values: ['*']
        }
      ]
    })
  );

  return result.LaunchTemplates?.map(lt => {
    return {
      id: lt.LaunchTemplateId,
      name: lt.LaunchTemplateName,
      version: lt.LatestVersionNumber
    };
  });
};

export const getLaunchTemplateLastVersionDescription = async (
  launchTemplateId: string
) => {
  const response = await client.send(
    new DescribeLaunchTemplateVersionsCommand({
      LaunchTemplateId: launchTemplateId,
      Versions: ['$Default']
    })
  );

  if (
    !response.LaunchTemplateVersions ||
    response.LaunchTemplateVersions.length === 0
  ) {
    throw new Error('No Launch Template Version found');
  }
  return response.LaunchTemplateVersions[0].VersionDescription;
};

export type StartInstanceInput = {
  launchTemplateId: string;
  title: string;
  costCenter: string;
  owner: string;
  schedule: string;
};

export const startInstance = async (input: StartInstanceInput) => {
  const tags = [
    {
      Key: 'Name',
      Value: input.title
    },
    {
      Key: 'Ec2LeaserDuration',
      Value: '6'
    },
    {
      Key: 'costcenter',
      Value: input.costCenter
    },
    {
      Key: 'project',
      Value: 'ec2-leaser'
    },
    {
      Key: 'owner',
      Value: input.owner
    },
    {
      Key: 'schedule',
      Value: input.schedule
    }
  ];

  const params: RunInstancesCommandInput = {
    MaxCount: 1,
    MinCount: 1,
    LaunchTemplate: {
      LaunchTemplateId: input.launchTemplateId
    },
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: tags
      },
      {
        ResourceType: 'volume',
        Tags: tags
      },
      {
        ResourceType: 'network-interface',
        Tags: tags
      }
    ],
    MetadataOptions: {
      HttpEndpoint: 'enabled',
      HttpTokens: 'required'
    }
  };

  const data = await client.send(new RunInstancesCommand(params));

  if (!data?.Instances || data?.Instances.length === 0) {
    throw new Error('Wrong result from the EC2 API');
  }

  return data.Instances[0];
};

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
    throw new Error("Can't find the instance EBS");
  }

  if (blockDeviceMappings.length > 1) {
    throw new Error(
      'Cannot snapshot an instance with more than a single EBS volume'
    );
  }
  // for each EBS of the instance, generate a snapshot
  const volumeId = blockDeviceMappings[0].Ebs?.VolumeId;

  if (!volumeId) {
    throw new Error('Cannot find the volumeId');
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
          Values: [`ec2-tools-${instanceId}`]
        }
      ]
    })
  );

  if (response.Snapshots && response.Snapshots.length > 0) {
    // if yes then delete it
    for (const snap of response.Snapshots) {
      await client.send(
        new DeleteSnapshotCommand({
          SnapshotId: snap.SnapshotId
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
            { Key: 'project', Value: 'ec2-tools' }
          ]
        }
      ]
    })
  );
};

export const replaceInstanceRootVolume = async (instanceId: string) => {
  // get instance detail to get EBS to snapshot
  const response = await client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    })
  );

  const instance = response.Reservations?.[0]?.Instances?.[0];
  const blockDeviceMappings = instance?.BlockDeviceMappings;

  if (!instance || !blockDeviceMappings) {
    throw new Error("Can't find the instance EBS");
  }

  // check if snapshot exist
  const snapshotResponse = await client.send(
    new DescribeSnapshotsCommand({
      Filters: [
        {
          Name: 'description',
          Values: [`ec2-tools-${instance.InstanceId}`]
        }
      ]
    })
  );

  // check if snapshot available!
  if (!snapshotResponse.Snapshots || snapshotResponse.Snapshots.length === 0) {
    throw new Error(
      `No snapshot available for instance ${instance.InstanceId}.`
    );
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
          Tags: instance.Tags?.filter(tag => !tag.Key?.startsWith('aws:'))
        }
      ]
    })
  );
};
