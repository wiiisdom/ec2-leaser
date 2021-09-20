import * as sst from "@serverless-stack/resources";
import { ApiAuthorizationType, Auth, Cron } from "@serverless-stack/resources";
interface BackendStackProps extends sst.StackProps {
  readonly googleClientId: string;
}

export default class BackendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Create a table for the cost center list
    const table = new sst.Table(this, `cost-center-list`, {
      fields: {
        id: sst.TableFieldType.NUMBER,
        name: sst.TableFieldType.STRING,
        description: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "id" },
    });

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultAuthorizationType: ApiAuthorizationType.AWS_IAM,
      routes: {
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
      },
    });

    // API permission
    api.attachPermissions([
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeLaunchTemplateVersions",
      "ec2:RunInstances",
      "ec2:CreateTags",
    ]);

    // Create the Cron task to destroy old ressources
    const cron = new Cron(this, "DestroyEc2", {
      schedule: "rate(20 minutes)",
      job: "src/TerminateInstance.handler",
    });

    // Cron permissions
    cron.attachPermissions(["ec2:DescribeInstances", "ec2:TerminateInstances"]);

    // Create an Auth via Google Identity
    const auth = new Auth(this, "Auth", {
      google: {
        clientId: props.googleClientId,
      },
    });

    // Allow user to use API
    auth.attachPermissionsForAuthUsers([api]);

    // Show API endpoint in output
    this.addOutputs({
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
