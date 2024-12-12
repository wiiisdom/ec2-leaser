import { SSTConfig } from 'sst';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Config, Cron, NextjsSite, Table } from 'sst/constructs';

export default {
  config(_input) {
    return {
      name: 'ec2-leaser',
      region: _input.stage === 'prod' ? 'eu-central-1' : 'us-east-1'
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      logRetention: 'one_year',
      runtime: 'nodejs20.x'
    });
    app.stack(
      function API({ stack }) {
        // Config
        const azureClientId = new Config.Secret(stack, 'AZURE_CLIENT_ID');
        const azureClientSecret = new Config.Secret(
          stack,
          'AZURE_CLIENT_SECRET'
        );
        const azureTenantId = new Config.Secret(stack, 'AZURE_TENANT_ID');
        const authSecret = new Config.Secret(stack, 'AUTH_SECRET');

        // Create a table for the cost center list
        const table = new Table(stack, `config`, {
          fields: {
            PK: 'string',
            SK: 'string'
          },
          primaryIndex: { partitionKey: 'PK', sortKey: 'SK' },
          cdk: {
            table: {
              removalPolicy: RemovalPolicy.DESTROY
            }
          }
        });

        // Create the Cron tasks to destroy old resources
        const destroyEc2Cron = new Cron(stack, 'DestroyEc2', {
          schedule: 'rate(20 minutes)',
          job: 'src/cron/terminate-instances.handler'
        });

        // Cron permissions
        destroyEc2Cron.attachPermissions([
          'ec2:DescribeInstances',
          'ec2:TerminateInstances'
        ]);

        const domain =
          stack.stage === 'prod'
            ? 'wiiisdom.com'
            : `${stack.stage}.wiiisdom.com`;

        const site = new NextjsSite(stack, 'Site', {
          environment: {
            NEXT_PUBLIC_SHOW_SNAPSHOT_RESTORE: app.stage !== 'prod' ? '1' : '0'
          },
          bind: [
            // see https://github.com/sst/sst/issues/3270#issuecomment-2218550203
            // if you add a bind here, it will required to undeploy/re-deploy the
            // NextjsSite construct in prod
            table,
            azureClientId,
            azureClientSecret,
            azureTenantId,
            authSecret
          ],
          permissions: [
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
          customDomain: {
            domainName: app.name + '.' + domain,
            hostedZone: domain
          },
          cdk: {
            distribution: {
              defaultBehavior: {
                responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS
              }
            },
            server: {
              logRetention: RetentionDays.ONE_YEAR
            }
          }
        });

        // alarms
        if (!app.local) {
          const alarmTopic = new Topic(stack, `${stack.stackName}-AlarmTopic`);
          alarmTopic.addSubscription(new EmailSubscription('lab@wiiisdom.com'));

          if (site.cdk?.function) {
            const alarm = new Alarm(stack, 'NextFunctionAlarm', {
              metric: site.cdk?.function?.metricErrors(),
              alarmName: `${stack.stackName} NextFunction`,
              threshold: 1,
              evaluationPeriods: 1
            });
            alarm.addAlarmAction(new SnsAction(alarmTopic));
          }

          const destroyEc2Alarm = new Alarm(stack, `FunctionAlarm-DestroyEC2`, {
            metric: destroyEc2Cron.jobFunction.metricErrors({
              period: Duration.minutes(15)
            }),
            alarmName: `${stack.stackName} Destroy EC2 Job`,
            threshold: 1,
            evaluationPeriods: 1
          });
          destroyEc2Alarm.addAlarmAction(new SnsAction(alarmTopic));

          const tableReadCapacity = new Alarm(
            stack,
            `FunctionAlarm-DynamoRead`,
            {
              metric: table.cdk.table.metricConsumedReadCapacityUnits({
                period: Duration.minutes(15)
              }),
              alarmName: `${stack.stackName} DynamoDB Consumed Read Capacity`,
              threshold: 5,
              evaluationPeriods: 1
            }
          );
          tableReadCapacity.addAlarmAction(new SnsAction(alarmTopic));

          const tableWriteCapacity = new Alarm(
            stack,
            `FunctionAlarm-DynamoWrite`,
            {
              metric: table.cdk.table.metricConsumedWriteCapacityUnits({
                period: Duration.minutes(15)
              }),
              alarmName: `${stack.stackName} DynamoDB Consumed Write Capacity`,
              threshold: 5,
              evaluationPeriods: 1
            }
          );
          tableWriteCapacity.addAlarmAction(new SnsAction(alarmTopic));
        }
      },
      {
        id: 'backend-stack',
        tags: {
          costcenter: 'eng:lab',
          project: 'ec2-leaser',
          owner: 'lab@wiiisdom.com',
          management: 'sst'
        }
      }
    );
  }
} satisfies SSTConfig;
