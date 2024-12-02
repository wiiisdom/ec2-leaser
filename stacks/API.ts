import { RemovalPolicy, Duration } from "aws-cdk-lib";
import {
  Api,
  Auth,
  Config,
  Cron,
  NextjsSite,
  StackContext,
  StaticSite,
  Table
} from "sst/constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { ResponseHeadersPolicy } from "aws-cdk-lib/aws-cloudfront";

export function API({ stack, app }: StackContext) {
  // Config
  const azureClientId = new Config.Secret(stack, "AZURE_CLIENT_ID");
  const azureClientSecret = new Config.Secret(stack, "AZURE_CLIENT_SECRET");
  const azureTenantId = new Config.Secret(stack, "AZURE_TENANT_ID");

  // Create a table for the cost center list
  const table = new Table(stack, `config`, {
    fields: {
      PK: "string",
      SK: "string"
    },
    primaryIndex: { partitionKey: "PK", sortKey: "SK" },
    cdk: {
      table: {
        removalPolicy: RemovalPolicy.DESTROY
      }
    }
  });

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    routes: {
      "GET /session": "packages/functions/src/handlers/api/session.handler",
      "GET /list": "packages/functions/src/handlers/api/list-templates.handler",
      "POST /description":
        "packages/functions/src/handlers/api/describe-template.handler",
      "POST /start":
        "packages/functions/src/handlers/api/start-instance.handler",
      "GET /costcenters": {
        function: {
          handler: "packages/functions/src/handlers/api/costcenters.handler",
          bind: [table]
        }
      },
      "GET /schedules": {
        function: {
          handler: "packages/functions/src/handlers/api/schedules.handler",
          bind: [table]
        }
      },
      "POST /ec2/snapshot":
        "packages/functions/src/handlers/api/snapshot.handler",
      "POST /ec2/restore": "packages/functions/src/handlers/api/restore.handler"
    }
  });

  // API permission
  api.attachPermissions([
    "ec2:DescribeLaunchTemplates",
    "ec2:DescribeLaunchTemplateVersions",
    "iam:CreateServiceLinkedRole",
    "ec2:RunInstances",
    "ec2:CreateTags",
    "ec2:DescribeInstances",
    "ec2:DescribeSnapshots",
    "ec2:CreateSnapshot",
    "ec2:DeleteSnapshot",
    "ec2:CreateReplaceRootVolumeTask"
  ]);

  // Create the Cron tasks to destroy old resources
  const destroyEc2Cron = new Cron(stack, "DestroyEc2", {
    schedule: "rate(20 minutes)",
    job: "packages/functions/src/handlers/cron/terminate-instances.handler"
  });

  // Cron permissions
  destroyEc2Cron.attachPermissions([
    "ec2:DescribeInstances",
    "ec2:TerminateInstances"
  ]);

  const domain =
    stack.stage === "prod" ? "wiiisdom.com" : `${stack.stage}.wiiisdom.com`;

  // Creates the full address to use as URL
  const siteDomain = app.name + "." + domain;

  const siteUrl = new Config.Parameter(stack, "SITE_URL", {
    value: `https://${siteDomain}`
  });

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/handlers/api/auth.handler",
      bind: [azureClientId, azureClientSecret, azureTenantId, siteUrl]
    }
  });

  auth.attach(stack, {
    api,
    prefix: "/auth"
  });

  const domainPrefix = `${stack.stage}-${app.name}`;

  const site = new NextjsSite(stack, "Site", {
    path: "packages/web",
    environment: {
      NEXT_PUBLIC_API: api.url,
      NEXT_PUBLIC_SHOW_SNAPSHOT_RESTORE: app.stage !== "prod" ? "1" : "0"
    },
    bind: [
      // see https://github.com/sst/sst/issues/3270#issuecomment-2218550203
      // if you add a bind here, it will required to undeploy/re-deploy the
      // NextjsSite construct in prod
    ],
    customDomain: {
      domainName: siteDomain,
      hostedZone: domain
    },
    cdk: {
      distribution: {
        defaultBehavior: {
          responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS
        }
      }
    }
  });

  // alarms
  if (!app.local) {
    const alarmTopic = new Topic(stack, `${stack.stackName}-AlarmTopic`);
    alarmTopic.addSubscription(new EmailSubscription("lab@wiiisdom.com"));
    for (const route of api.routes) {
      const func = api.getFunction(route);
      if (func) {
        const alarm = new Alarm(stack, `FunctionAlarm-${func.id}`, {
          metric: func.metricErrors({
            period: Duration.minutes(15)
          }),
          alarmName: `${stack.stackName} ${route}`,
          threshold: 5,
          evaluationPeriods: 1
        });
        alarm.addAlarmAction(new SnsAction(alarmTopic));
      }
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

    const tableReadCapacity = new Alarm(stack, `FunctionAlarm-DynamoRead`, {
      metric: table.cdk.table.metricConsumedReadCapacityUnits({
        period: Duration.minutes(15)
      }),
      alarmName: `${stack.stackName} DynamoDB Consumed Read Capacity`,
      threshold: 5,
      evaluationPeriods: 1
    });
    tableReadCapacity.addAlarmAction(new SnsAction(alarmTopic));

    const tableWriteCapacity = new Alarm(stack, `FunctionAlarm-DynamoWrite`, {
      metric: table.cdk.table.metricConsumedWriteCapacityUnits({
        period: Duration.minutes(15)
      }),
      alarmName: `${stack.stackName} DynamoDB Consumed Write Capacity`,
      threshold: 5,
      evaluationPeriods: 1
    });
    tableWriteCapacity.addAlarmAction(new SnsAction(alarmTopic));
  }

  // Show API endpoint  and site url in output
  stack.addOutputs({
    ApiEndpoint: {
      value: api.url,
      exportName: `${app.stage}-${app.name}-api`
    }
  });
}
