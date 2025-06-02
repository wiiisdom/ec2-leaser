// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'ec2-leaser',
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
      protect: ['prod'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-1',
          defaultTags: {
            tags: {
              costcenter: 'eng:lab',
              project: 'ec2-leaser',
              management: 'sst',
              owner: 'lab@wiiisdom.com'
            }
          }
        }
      }
    };
  },
  async run() {
    const azureClientId = new sst.Secret('AzureClientId');
    const azureClientSecret = new sst.Secret('AzureClientSecret');
    const azureTenantId = new sst.Secret('AzureTenantId');
    const authSecret = new sst.Secret('AuthSecret');

    // Create a table for the cost center list
    const table = new sst.aws.Dynamo('Table', {
      fields: {
        PK: 'string',
        SK: 'string'
      },
      primaryIndex: { hashKey: 'PK', rangeKey: 'SK' }
    });

    // Create the Cron tasks to destroy old resources
    const destroyEc2Cron = new sst.aws.Cron('DestroyEc2', {
      schedule: 'rate(20 minutes)',
      function: {
        handler: 'src/cron/terminate-instances.handler',
        permissions: [
          {
            actions: ['ec2:DescribeInstances', 'ec2:TerminateInstances'],
            resources: ['*']
          }
        ]
      }
    });

    const domain =
      $app.stage === 'prod' ? 'wiiisdom.com' : `${$app.stage}.wiiisdom.com`;
    const site = new sst.aws.Nextjs('Site', {
      link: [
        azureClientId,
        azureClientSecret,
        azureTenantId,
        authSecret,
        table,
        destroyEc2Cron
      ],
      domain: $app.name + '.' + domain,
      permissions: [
        {
          actions: [
            'ec2:DescribeLaunchTemplates',
            'ec2:DescribeLaunchTemplateVersions',
            'iam:CreateServiceLinkedRole',
            'ec2:RunInstances',
            'ec2:CreateTags',
            'ec2:DescribeInstances',
            'ec2:DescribeSnapshots',
            'ec2:CreateSnapshot',
            'ec2:DeleteSnapshot',
            'ec2:CreateReplaceRootVolumeTask'
          ],
          resources: ['*']
        }
      ]
    });
    if (!$dev) {
      // Setup alarms
      const alarmTopic = new sst.aws.SnsTopic('AlarmTopic');
      new aws.sns.TopicSubscription('AlarmSubscription', {
        topic: alarmTopic.arn,
        protocol: 'email',
        endpoint: 'lab@wiiisdom.com'
      });
      site.nodes.server &&
        new aws.cloudwatch.MetricAlarm('NextFunctionAlarm', {
          metricName: 'Errors',
          threshold: 1,
          evaluationPeriods: 1,
          comparisonOperator: 'GreaterThanThreshold',
          statistic: 'Sum',
          period: 60,
          namespace: 'AWS/Lambda',
          alarmActions: [alarmTopic.arn],
          dimensions: {
            FunctionName: site.nodes.server.name
          }
        });
      site.nodes.server &&
        new aws.cloudwatch.MetricAlarm('Ec2LeaserNextSite5xxAlarm', {
          metricName: 'Url5xxCount',
          alarmDescription:
            'Alarm when the Next.js site returns more than 5 5xx errors in 5 minutes',
          threshold: 5,
          evaluationPeriods: 1,
          comparisonOperator: 'GreaterThanThreshold',
          statistic: 'Sum',
          period: 300,
          namespace: 'AWS/Lambda',
          alarmActions: [alarmTopic.arn],
          dimensions: {
            FunctionName: site.nodes.server.name
          }
        });

      new aws.cloudwatch.MetricAlarm('DestroyEc2Alarm', {
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: 'GreaterThanThreshold',
        statistic: 'Sum',
        period: 900, // 15 minutes in seconds, equivalent to Duration.minutes(15)
        namespace: 'AWS/Lambda',
        metricName: `${$app.name}-${$app.stage} Destroy EC2 Job`,
        alarmActions: [alarmTopic.arn],
        dimensions: {
          FunctionName: destroyEc2Cron.nodes.function.name
        }
      });
      new aws.cloudwatch.MetricAlarm('TableReadCapacityAlarm', {
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: 'GreaterThanThreshold',
        statistic: 'Sum',
        period: 900, // 15 minutes in seconds
        namespace: 'AWS/DynamoDB',
        metricName: `${$app.name}-${$app.stage} DynamoDB Consumed Read Capacity`,
        alarmActions: [alarmTopic.arn],
        dimensions: {
          TableName: table.name
        }
      });

      // DynamoDB Write Capacity alarm
      new aws.cloudwatch.MetricAlarm('TableWriteCapacityAlarm', {
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: 'GreaterThanThreshold',
        statistic: 'Sum',
        period: 900, // 15 minutes in seconds
        namespace: 'AWS/DynamoDB',
        metricName: `${$app.name}-${$app.stage} DynamoDB Consumed Write Capacity`,
        alarmActions: [alarmTopic.arn],
        dimensions: {
          TableName: table.name
        }
      });
    }
  }
});
