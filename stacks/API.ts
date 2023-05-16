import { RemovalPolicy } from "aws-cdk-lib";
import {
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
  OAuthScope,
  ProviderAttribute
} from "aws-cdk-lib/aws-cognito";
import {
  Api,
  Cognito,
  Cron,
  StackContext,
  StaticSite,
  Table
} from "sst/constructs";

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
      "GET /requests": "packages/functions/src/TerminateSpotRequest.handler",
      "GET /list": "packages/functions/src/LaunchTemplate.list",
      "POST /description": "packages/functions/src/LaunchTemplate.description",
      "POST /start": "packages/functions/src/Instance.start",
      "GET /costcenters": {
        function: {
          handler: "packages/functions/src/GetCostCenterList.list",
          bind: [table]
        }
      },
      "GET /schedules": {
        function: {
          handler: "packages/functions/src/GetSchedulesList.list",
          bind: [table]
        }
      }
    }
  });

  // API permission
  api.attachPermissions([
    "ec2:DescribeLaunchTemplates",
    "ec2:DescribeLaunchTemplateVersions",
    "iam:CreateServiceLinkedRole",
    "ec2:RunInstances",
    "ec2:CreateTags"
  ]);

  // Create the Cron tasks to destroy old resources
  const destroyEc2Cron = new Cron(stack, "DestroyEc2", {
    schedule: "rate(20 minutes)",
    job: "packages/functions/src/TerminateInstance.handler"
  });

  const cancelSpotRequestsCron = new Cron(stack, "CanceSpotRequests", {
    schedule: "rate(20 minutes)",
    job: "packages/functions/src/TerminateSpotRequest.handler"
  });

  // Cron permissions
  destroyEc2Cron.attachPermissions([
    "ec2:DescribeInstances",
    "ec2:TerminateInstances"
  ]);
  cancelSpotRequestsCron.attachPermissions([
    "ec2:DescribeSpotInstanceRequests",
    "ec2:DescribeInstances",
    "ec2:CancelSpotInstanceRequests",
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
      VITE_DEFAULT_SPOT: "0",
      VITE_API: api.url,
      VITE_COGNITO_REGION: stack.region,
      VITE_COGNITO_USER_POOL_ID: auth.cdk.userPool.userPoolId,
      VITE_COGNITO_USER_POOL_CLIENT_ID:
        auth.cdk.userPoolClient.userPoolClientId,
      VITE_COGNITO_IDENTITY_POOL_ID: auth.cognitoIdentityPoolId as string,
      VITE_COGNITO_DOMAIN: `${domainPrefix}.auth.${stack.region}.amazoncognito.com`,
      VITE_PUBLIC_DOMAIN: app.local
        ? "http://localhost:5173"
        : `https://${siteDomain}`
    },
    customDomain: {
      domainName: siteDomain,
      hostedZone: domain
    }
  });

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
