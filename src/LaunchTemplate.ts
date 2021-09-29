import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import EC2 from "aws-sdk/clients/ec2";
export const list: APIGatewayProxyHandlerV2 = async () => {
  const ec2 = new EC2();
  const ltData = await ec2
    .describeLaunchTemplates({
      Filters: [
        {
          Name: "tag:Ec2Leaser",
          Values: ["*"],
        },
      ],
    })
    .promise();
  const launchTemplates = ltData.LaunchTemplates?.map((lt) => {
    return {
      id: lt.LaunchTemplateId,
      name: lt.LaunchTemplateName,
      version: lt.LatestVersionNumber,
    };
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(launchTemplates),
  };
};

export const description: APIGatewayProxyHandlerV2 = async (event) => {
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

  const ltvData = await ec2
    .describeLaunchTemplateVersions({
      LaunchTemplateId: launchTemplateId,
      Versions: ["$Default"],
    })
    .promise();

  if (
    ltvData.LaunchTemplateVersions &&
    ltvData.LaunchTemplateVersions.length === 1
  ) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        description: ltvData.LaunchTemplateVersions[0].VersionDescription,
      }),
    };
  } else {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        message: "Error during Launch Template Version query",
      }),
    };
  }
};
