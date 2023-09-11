import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import EC2 from 'aws-sdk/clients/ec2';

const TEXT_PLAIN = { 'Content-Type': 'text/plain' };

export const start: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  const ec2 = new EC2();
  if (event.body === undefined) {
    return {
      statusCode: 500,
      headers: TEXT_PLAIN,
      body: JSON.stringify({ message: 'Missing parameters' }),
    };
  }
  const request = JSON.parse(event.body);

  const launchTemplateId = request.instanceId;
  const name = request.title;
  const spotInstance = request.isSpotInstance || undefined;
  const { owner, costCenter, schedule } = request;

  const tags: EC2.TagList = [
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

  const params: EC2.RunInstancesRequest = {
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
    InstanceMarketOptions: spotInstance && {
      MarketType: 'spot',
      SpotOptions: {
        InstanceInterruptionBehavior: 'stop',
        SpotInstanceType: 'persistent',
      },
    },
    MetadataOptions: {
      HttpEndpoint: 'enabled',
      HttpTokens: 'required',
    },
  };

  try {
    const data = await ec2.runInstances(params).promise();

    if (!data?.Instances) {
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
      body: JSON.stringify(error),
    };
  }
};
