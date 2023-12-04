import { DescribeLaunchTemplateVersionsCommand, EC2Client } from '@aws-sdk/client-ec2';
import { SecureHandler } from 'src/utils/handlerUtils';

const client = new EC2Client({});

export const handler = SecureHandler(async event => {
  try {
    if (event.body === undefined) {
      throw new Error('Missing parameters');
    }
    const request = JSON.parse(event.body);

    const launchTemplateId = request.instanceId;

    const ltvData = await client.send(
      new DescribeLaunchTemplateVersionsCommand({
        LaunchTemplateId: launchTemplateId,
        Versions: ['$Default'],
      })
    );

    if (!ltvData.LaunchTemplateVersions || ltvData.LaunchTemplateVersions.length === 0) {
      throw new Error('No Launch Template Version found');
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        description: ltvData.LaunchTemplateVersions[0].VersionDescription,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: (error as Error).message,
    };
  }
});
