import * as sst from "@serverless-stack/resources";
import { ApiAuthorizationType, Auth, Cron } from "@serverless-stack/resources";
import { RemovalPolicy } from "aws-cdk-lib";

interface BackendStackProps extends sst.StackProps {
  readonly googleClientId: string;
}

export default class BackendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Create a table for the cost center list
    const table = new sst.Table(this, `config`, {
      fields: {
        PK: sst.TableFieldType.STRING,
        SK: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "PK", sortKey: "SK" },
      dynamodbTable: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    });

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultAuthorizationType: ApiAuthorizationType.AWS_IAM,
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
              TABLE_NAME: table.dynamodbTable.tableName,
              REGION: this.region,
            },
            permissions: [table],
          },
        },
        "GET /schedules": {
          function: {
            srcPath: "./",
            handler: "src/GetSchedulesList.list",
            environment: {
              TABLE_NAME: table.dynamodbTable.tableName,
              REGION: this.region,
            },
            permissions: [table],
          },
        },
      },
    });

    // API permission
    api.attachPermissions([
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeLaunchTemplateVersions",
      "iam:CreateServiceLinkedRole",
      "ec2:RunInstances",
      "ec2:CreateTags",
    ]);

    // Create the Cron tasks to destroy old resources
    const destroyEc2Cron = new Cron(this, "DestroyEc2", {
      schedule: "rate(20 minutes)",
      job: "src/TerminateInstance.handler",
    });

    const cancelSpotRequestsCron = new Cron(this, "CanceSpotRequests", {
      schedule: "rate(20 minutes)",
      job: "src/TerminateSpotRequest.handler",
    });

    // Cron permissions
    destroyEc2Cron.attachPermissions([
      "ec2:DescribeInstances",
      "ec2:TerminateInstances",
    ]);
    cancelSpotRequestsCron.attachPermissions([
      "ec2:DescribeSpotInstanceRequests",
      "ec2:DescribeInstances",
      "ec2:CancelSpotInstanceRequests",
      "ec2:TerminateInstances",
    ]);

    // Create an Auth via Google Identity
    const auth = new Auth(this, "Auth", {
      google: {
        clientId: props.googleClientId,
      },
    });

    // Allow user to use API
    auth.attachPermissionsForAuthUsers([api]);

    const domain =
      scope.stage === "prod" ? "wiiisdom.com" : `${scope.stage}.wiiisdom.com`;

    // Creates the full address to use as URL
    const siteDomain = scope.name + "." + domain;

    // Handles S3 Bucket creation and deployment, and CloudFront CDN setup (certificate, route53)
    const site = new sst.ReactStaticSite(this, "ReactStaticSite", {
      path: "frontend",
      buildCommand: "yarn && yarn build",
      environment: {
        REACT_APP_DEFAULT_SPOT: "0",
        REACT_APP_API: api.url,
        REACT_APP_COGNITO_REGION: scope.region,
        REACT_APP_GOOGLE_CLIENT_ID: props.googleClientId,
        REACT_APP_COGNITO_IDENTITY_POOL_ID: auth.cognitoCfnIdentityPool.ref,
      },
      customDomain: {
        domainName: siteDomain,
        hostedZone: domain,
      },
    });

    // Show API endpoint  and site url in output
    this.addOutputs({
      SiteUrl: site.customDomainUrl || site.url,
      ApiEndpoint: {
        value: api.url,
        exportName: `${scope.stage}-${scope.name}-api`,
      },
      IdentityPoolId: {
        value: auth.cognitoCfnIdentityPool.ref,
        exportName: `${scope.stage}-${scope.name}-poolid`,
      },
    });
  }
}
