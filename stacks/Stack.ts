import * as sst from "@serverless-stack/resources";
import { Cognito, Cron } from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";
import {
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderGoogle,
  OAuthScope,
  ProviderAttribute
} from "aws-cdk-lib/aws-cognito";

export default class BackendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: sst.StackProps) {
    super(scope, id, props);

    // Create a table for the cost center list
    const table = new sst.Table(this, `config`, {
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
    const api = new sst.Api(this, "Api", {
      defaults: {
        authorizer: "iam"
      },
      routes: {
        "GET /requests": "src/TerminateSpotRequest.handler",
        "GET /list": "src/LaunchTemplate.list",
        "POST /description": "src/LaunchTemplate.description",
        "POST /start": "src/Instance.start",
        "GET /costcenters": {
          function: {
            srcPath: "./",
            handler: "src/GetCostCenterList.list",
            environment: {
              TABLE_NAME: table.cdk.table.tableName,
              REGION: this.region
            },
            permissions: [table]
          }
        },
        "GET /schedules": {
          function: {
            srcPath: "./",
            handler: "src/GetSchedulesList.list",
            environment: {
              TABLE_NAME: table.cdk.table.tableName,
              REGION: this.region
            },
            permissions: [table]
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
    const destroyEc2Cron = new Cron(this, "DestroyEc2", {
      schedule: "rate(20 minutes)",
      job: "src/TerminateInstance.handler"
    });

    const cancelSpotRequestsCron = new Cron(this, "CanceSpotRequests", {
      schedule: "rate(20 minutes)",
      job: "src/TerminateSpotRequest.handler"
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
      scope.stage === "prod" ? "wiiisdom.com" : `${scope.stage}.wiiisdom.com`;

    // Creates the full address to use as URL
    const siteDomain = scope.name + "." + domain;

    // Create an Auth via Google Identity
    const auth = new Cognito(this, "Auth", {
      cdk: {
        userPoolClient: {
          authFlows: {
            custom: true,
            userSrp: true
          },
          oAuth: {
            scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
            callbackUrls: ["http://localhost:3000", `https://${siteDomain}`],
            logoutUrls: ["http://localhost:3000", `https://${siteDomain}`],
            flows: {
              authorizationCodeGrant: true
            }
          },
          supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE]
        }
      }
    });

    const googleIdp = new UserPoolIdentityProviderGoogle(this, "GoogleIdP", {
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

    const domainPrefix = `${scope.stage}-${scope.name}`;
    auth.cdk.userPool.addDomain("default", {
      cognitoDomain: {
        domainPrefix
      }
    });

    // Allow user to use API
    auth.attachPermissionsForAuthUsers(this, [api]);

    // Handles S3 Bucket creation and deployment, and CloudFront CDN setup (certificate, route53)
    const site = new sst.ReactStaticSite(this, "ReactStaticSite", {
      path: "frontend",
      buildCommand: "yarn && yarn build",
      environment: {
        REACT_APP_DEFAULT_SPOT: "0",
        REACT_APP_API: api.url,
        REACT_APP_COGNITO_REGION: scope.region,
        REACT_APP_COGNITO_USER_POOL_ID: auth.cdk.userPool.userPoolId,
        REACT_APP_COGNITO_USER_POOL_CLIENT_ID:
          auth.cdk.userPoolClient.userPoolClientId,
        REACT_APP_COGNITO_IDENTITY_POOL_ID:
          auth.cognitoIdentityPoolId as string,
        REACT_APP_COGNITO_DOMAIN: `${domainPrefix}.auth.${scope.region}.amazoncognito.com`,
        REACT_APP_PUBLIC_DOMAIN: scope.local
          ? "http://localhost:3000"
          : `https://${siteDomain}`
      },
      customDomain: {
        domainName: siteDomain,
        hostedZone: domain
      }
    });

    // Show API endpoint  and site url in output
    this.addOutputs({
      SiteUrl: site.customDomainUrl || site.url,
      ApiEndpoint: {
        value: api.url,
        exportName: `${scope.stage}-${scope.name}-api`
      },
      IdentityPoolId: {
        value: auth.cognitoIdentityPoolId as string,
        exportName: `${scope.stage}-${scope.name}-poolid`
      }
    });
  }
}
