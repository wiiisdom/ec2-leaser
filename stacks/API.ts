import { RemovalPolicy, Duration } from "aws-cdk-lib";
import {
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
  UserPoolIdentityProviderOidc,
  OAuthScope,
  ProviderAttribute
} from "aws-cdk-lib/aws-cognito";
import {
  Api,
  Cognito,
  Config,
  Cron,
  StackContext,
  StaticSite,
  Table
} from "sst/constructs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";

export function API({ stack, app }: StackContext) {
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
    defaults: {
      authorizer: "iam"
    },
    routes: {
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

  // Create an Auth via Google Identity
  const auth = new Cognito(stack, "Auth", {
    cdk: {
      userPoolClient: {
        authFlows: {
          custom: true,
          userSrp: true
        },
        oAuth: {
          scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
          callbackUrls: ["http://localhost:5173", `https://${siteDomain}`],
          logoutUrls: ["http://localhost:5173", `https://${siteDomain}`],
          flows: {
            authorizationCodeGrant: true
          }
        },

        supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE]
      }
    }
  });

  const googleIdp = new UserPoolIdentityProviderGoogle(stack, "GoogleIdP", {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    userPool: auth.cdk.userPool,
    attributeMapping: {
      email: ProviderAttribute.GOOGLE_EMAIL,
      fullname: ProviderAttribute.GOOGLE_NAME
    },
    scopes: ["email", "openid", "profile"]
  });

  auth.cdk.userPoolClient.node.addDependency(googleIdp);

  const azureADIdp = new UserPoolIdentityProviderOidc(stack, "AzureADIdP", {
    name: "AzureAD",
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    issuerUrl: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
    userPool: auth.cdk.userPool,
    attributeMapping: {
      email: ProviderAttribute.other("email"),
      fullname: ProviderAttribute.other("name")
    },
    scopes: ["email", "openid", "profile"]
  });

  auth.cdk.userPool.registerIdentityProvider(azureADIdp);
  auth.cdk.userPoolClient.node.addDependency(azureADIdp);

  const domainPrefix = `${stack.stage}-${app.name}`;
  auth.cdk.userPool.addDomain("default", {
    cognitoDomain: {
      domainPrefix
    }
  });

  // Allow user to use API
  auth.attachPermissionsForAuthUsers(stack, [api]);

  // Handles S3 Bucket creation and deployment, and CloudFront CDN setup (certificate, route53)
  const site = new StaticSite(stack, "Site", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "yarn build",
    environment: {
      VITE_API: api.url,
      VITE_COGNITO_REGION: stack.region,
      VITE_COGNITO_USER_POOL_ID: auth.cdk.userPool.userPoolId,
      VITE_COGNITO_USER_POOL_CLIENT_ID:
        auth.cdk.userPoolClient.userPoolClientId,
      VITE_COGNITO_IDENTITY_POOL_ID: auth.cognitoIdentityPoolId as string,
      VITE_COGNITO_DOMAIN: `${domainPrefix}.auth.${stack.region}.amazoncognito.com`,
      VITE_PUBLIC_DOMAIN: app.local
        ? "http://localhost:5173"
        : `https://${siteDomain}`,
      VITE_SHOW_SNAPSHOT_RESTORE: app.stage !== "prod" ? "1" : "0"
    },
    customDomain: {
      domainName: siteDomain,
      hostedZone: domain
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
    },
    IdentityPoolId: {
      value: auth.cognitoIdentityPoolId as string,
      exportName: `${app.stage}-${app.name}-poolid`
    }
  });
}
