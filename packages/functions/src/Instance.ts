import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import EC2 from "aws-sdk/clients/ec2";

export const start: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  const ec2 = new EC2();
  if (event.body == undefined) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ message: "Missing parameters" }),
    };
  }
  const request = JSON.parse(event.body);

  const launchTemplateId = request.instanceId;
  const name = request.title;
  const owner = request.owner;
  const spotInstance = request.isSpotInstance || undefined;
  const costCenter = request.costCenter;
  const schedule = request.schedule;

  const tags: EC2.TagList = [
    {
      Key: "Name",
      Value: name,
    },
    {
      Key: "Ec2LeaserDuration",
      Value: "6",
    },
    {
      Key: "costcenter",
      Value: costCenter,
    },
    {
      Key: "owner",
      Value: owner,
    },
    {
      Key: "schedule",
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
        ResourceType: "instance",
        Tags: tags,
      },
      {
        ResourceType: "volume",
        Tags: tags,
      },
    ],
    InstanceMarketOptions: spotInstance && {
      MarketType: "spot",
      SpotOptions: {
        InstanceInterruptionBehavior: "stop",
        SpotInstanceType: "persistent",
      },
    },
  };

  try {
    const data = await ec2.runInstances(params).promise();

    if (!data || !data.Instances) {
      throw new Error("Wrong result from the EC2 API");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        instanceId: data.Instances[0].InstanceId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error),
    };
  }
};
