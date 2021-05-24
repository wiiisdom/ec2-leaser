import * as sst from "@serverless-stack/resources";
import { ApiAuthorizationType, Auth, Cron } from "@serverless-stack/resources";

export default class BackendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultAuthorizationType: ApiAuthorizationType.AWS_IAM,
      routes: {
        "GET /list": "src/LaunchTemplate.list",
        "POST /description": "src/LaunchTemplate.description",
        "POST /start": "src/Instance.start",
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
        clientId:
          "912868966610-17ml6d14mikkcovoao16qbebef984lqq.apps.googleusercontent.com",
      },
    });

    // Allow user to use API
    auth.attachPermissionsForAuthUsers([api]);

    // Show API endpoint in output
    this.addOutputs({
      ApiEndpoint: api.url,
      IdentityPoolId: auth.cognitoCfnIdentityPool.ref,
    });
  }
}
