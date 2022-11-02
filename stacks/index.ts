import Stack from "./Stack";
import * as sst from "@serverless-stack/resources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    logRetention: "three_months"
  });

  const googleClientId =
    "912868966610-17ml6d14mikkcovoao16qbebef984lqq.apps.googleusercontent.com";

  const tags = {
    costcenter: "eng:lab",
    project: "ec2-leaser",
    owner: "lab@wiiisdom.com"
  };

  new Stack(app, "backend-stack", {
    tags,
    googleClientId
  });
}
