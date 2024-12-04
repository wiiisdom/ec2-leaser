import { mockClient } from 'aws-sdk-client-mock';

import {
  DescribeLaunchTemplatesCommand,
  DescribeLaunchTemplateVersionsCommand,
  EC2Client
} from '@aws-sdk/client-ec2';
import {
  getLaunchTemplateLastVersionDescription,
  listLaunchTemplates
} from '@/lib/ec2Utils';
import { expect, it } from 'vitest';

const ec2ClientMock = mockClient(EC2Client);

it('listLaunchTemplates must return a launch template list', async () => {
  ec2ClientMock.on(DescribeLaunchTemplatesCommand).resolves({
    LaunchTemplates: [
      {
        LaunchTemplateId: 'id',
        LaunchTemplateName: 'name',
        LatestVersionNumber: 1
      }
    ]
  });
  const result = await listLaunchTemplates();
  expect(result).toStrictEqual([
    {
      id: 'id',
      name: 'name',
      version: 1
    }
  ]);
});

it('getLaunchTemplateLastVersionDescription must return a launch template description', async () => {
  ec2ClientMock.on(DescribeLaunchTemplateVersionsCommand).resolves({
    LaunchTemplateVersions: [
      {
        LaunchTemplateId: 'id',
        VersionDescription: 'description'
      }
    ]
  });

  const result =
    await getLaunchTemplateLastVersionDescription('launchTemplateId');
  expect(result).toBe('description');
});
