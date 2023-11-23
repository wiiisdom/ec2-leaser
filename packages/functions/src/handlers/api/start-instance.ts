import { EC2Client, RunInstancesCommand, RunInstancesCommandInput } from '@aws-sdk/client-ec2';
import { ApiHandler } from 'sst/node/api';

const client = new EC2Client({});

const TEXT_PLAIN = { 'Content-Type': 'text/plain' };

export const handler = ApiHandler(async event => {
  try {
    if (event.body === undefined) {
      throw new Error('Missing parameters');
    }
    const request = JSON.parse(event.body);

    const launchTemplateId = request.instanceId;
    const name = request.title;
    const { owner, costCenter, schedule } = request;

    const tags = [
      {
        Key: 'Name',
        Value: name,
      },
      {
        Key: 'Ec2LeaserDuration',
        Value: '6',
      },
      {
        Key: 'costcenter',
        Value: costCenter,
      },
      {
        Key: 'owner',
        Value: owner,
      },
      {
        Key: 'schedule',
        Value: schedule,
      },
    ];

    const params: RunInstancesCommandInput = {
      MaxCount: 1,
      MinCount: 1,
      LaunchTemplate: {
        LaunchTemplateId: launchTemplateId,
      },
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: tags,
        },
        {
          ResourceType: 'volume',
          Tags: tags,
        },
      ],
      MetadataOptions: {
        HttpEndpoint: 'enabled',
        HttpTokens: 'required',
      },
    };

    const data = await client.send(new RunInstancesCommand(params));

    if (!data?.Instances || data?.Instances.length === 0) {
      throw new Error('Wrong result from the EC2 API');
    }

    return {
      statusCode: 200,
      headers: TEXT_PLAIN,
      body: JSON.stringify({
        instanceId: data.Instances[0].InstanceId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: TEXT_PLAIN,
      body: (error as Error).message,
    };
  }
});
