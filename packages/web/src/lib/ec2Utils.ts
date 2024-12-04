import {
  DescribeLaunchTemplatesCommand,
  DescribeLaunchTemplateVersionsCommand,
  EC2Client
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
