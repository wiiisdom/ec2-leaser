import BackendStack from "./BackendStack";
import * as sst from "@serverless-stack/resources";
import ReactFrontendStack from "./FrontendStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  // check environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.DOMAIN) {
    throw new Error("GOOGLE_CLIENT_ID and/or DOMAIN environment variable are not set");
  }

  // create backend as variable so after its properties can be referenced.
  const backend = new BackendStack(app, "backend-stack", {
    tags: {
      costcenter: "lab",
      project: "ec2-leaser",
      owner: "360lab@360suite.io",
    },
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });

  // create a React stack that makes use of api and auth resources created in the backend stack.
  new ReactFrontendStack(app, "frontend-stack", {
    api: backend.api,
    auth: backend.auth,
    domain: process.env.DOMAIN,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    tags: { costcenter: "lab", project: "ec2-leaser", owner: "360labs@360suite.io" },
  });
}
