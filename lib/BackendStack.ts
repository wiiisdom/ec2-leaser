import { RemovalPolicy } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";
import { ApiAuthorizationType, Auth, Cron } from "@serverless-stack/resources";
interface BackendStackProps extends sst.StackProps {
  readonly googleClientId: string;
}

export default class BackendStack extends sst.Stack {
  // Make these two properties public so they can be accessed when an object is declared via this class.
  api;
  auth;

  constructor(scope: sst.App, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Create a table for the cost center list
    const table = new sst.Table(this, `cost-center-list`, {
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
    this.api = new sst.Api(this, "Api", {
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
    this.api.attachPermissions([
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeLaunchTemplateVersions",
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
    destroyEc2Cron.attachPermissions(["ec2:DescribeInstances", "ec2:TerminateInstances"]);
    cancelSpotRequestsCron.attachPermissions([
      "ec2:DescribeSpotInstanceRequests",
      "ec2:DescribeInstances",
      "ec2:CancelSpotInstanceRequests",
      "ec2:TerminateInstances",
    ]);

    // Create an Auth via Google Identity
    this.auth = new Auth(this, "Auth", {
      google: {
        clientId: props.googleClientId,
      },
    });

    // Allow user to use API
    this.auth.attachPermissionsForAuthUsers([this.api]);

    // Show API endpoint in output
    this.addOutputs({
      ApiEndpoint: {
        value: this.api.url,
        exportName: `${scope.stage}-${scope.name}-api`,
      },
      IdentityPoolId: {
        value: this.auth.cognitoCfnIdentityPool.ref,
        exportName: `${scope.stage}-${scope.name}-poolid`,
      },
    });
  }
}
