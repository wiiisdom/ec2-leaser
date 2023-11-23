import { DescribeLaunchTemplatesCommand, EC2Client } from '@aws-sdk/client-ec2';
import { ApiHandler } from 'sst/node/api';

const client = new EC2Client({});

export const handler = ApiHandler(async () => {
  try {
    const ltData = await client.send(
      new DescribeLaunchTemplatesCommand({
        Filters: [
          {
            Name: 'tag:Ec2Leaser',
            Values: ['*'],
          },
        ],
      })
    );
    const launchTemplates = ltData.LaunchTemplates?.map(lt => {
      return {
        id: lt.LaunchTemplateId,
        name: lt.LaunchTemplateName,
        version: lt.LatestVersionNumber,
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(launchTemplates),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: (error as Error).message,
    };
  }
});
