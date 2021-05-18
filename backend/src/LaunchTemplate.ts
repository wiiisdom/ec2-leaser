import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import EC2 from "aws-sdk/clients/ec2";
export const list: APIGatewayProxyHandlerV2 = async () => {
  const ec2 = new EC2();
  const ltData = await ec2.describeLaunchTemplates({}).promise();
  const launchTemplates = ltData.LaunchTemplates?.map((lt) => {
    return {
      id: lt.LaunchTemplateId,
      name: lt.LaunchTemplateName,
    };
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(launchTemplates),
  };
};
