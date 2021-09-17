import * as sst from "@serverless-stack/resources";
import { ApiAuthorizationType, Auth, Cron } from "@serverless-stack/resources";
interface BackendStackProps extends sst.StackProps {
  readonly googleClientId: string;
  readonly table: sst.Table;
}

export default class BackendStack extends sst.Stack {
  public api: sst.Api;

  constructor(scope: sst.App, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { table } = props;

    // Create the HTTP API
    this.api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        environment: {
          TABLE_NAME: table.dynamodbTable.tableName,
        },
      },
      defaultAuthorizationType: ApiAuthorizationType.AWS_IAM,
      routes: {
        "GET /list": "src/LaunchTemplate.list",
        "POST /description": "src/LaunchTemplate.description",
        "POST /start": "src/Instance.start",
        "GET /costcenters": "src/GetCostCenterList.list",
      },
    });

    // API permission
    this.api.attachPermissions([
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeLaunchTemplateVersions",
      "ec2:RunInstances",
      "ec2:CreateTags",
      "dynamoDB:Scan",
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
    auth.attachPermissionsForAuthUsers([this.api]);

    // Show API endpoint in output
    this.addOutputs({
      ApiEndpoint: {
        value: this.api.url,
        exportName: `${scope.stage}-${scope.name}-api`,
      },
      IdentityPoolId: {
        value: auth.cognitoCfnIdentityPool.ref,
        exportName: `${scope.stage}-${scope.name}-poolid`,
      },
    });
  }
}
