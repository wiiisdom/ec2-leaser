import * as sst from "@serverless-stack/resources";
import DynamoDBStack from "./DynamoDBStack";
import BackendStack from "./BackendStack";
import FrontendStack from "./FrontendStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  // check environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.DOMAIN) {
    throw new Error("GOOGLE_CLIENT_ID and/or DOMAIN environment variable are not set");
  }

  const dynamoDB = new DynamoDBStack(app, "dynamodb-stack");

  new BackendStack(app, "backend-stack", {
    tags: {
      costcenter: "lab",
      project: "ec2-leaser",
      owner: "360lab@360suite.io",
    },
    table: dynamoDB.table,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });

  new FrontendStack(app, "frontend-stack", {
    tags: {
      costcenter: "lab",
      project: "ec2-leaser",
      owner: "360lab@360suite.io",
    },
    domain: process.env.DOMAIN,
    subDomain: app.name,
  });
}
