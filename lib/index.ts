import BackendStack from "./BackendStack";
import * as sst from "@serverless-stack/resources";
import ReactFrontendStack from "./FrontendStack";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  const googleClientId = "912868966610-17ml6d14mikkcovoao16qbebef984lqq.apps.googleusercontent.com";

  const tags = {
    costcenter: "eng:lab",
    project: "ec2-leaser",
    owner: "lab@wiiisdom.com",
  };

  // create backend as variable so after its properties can be referenced.
  const backend = new BackendStack(app, "backend-stack", {
    tags,
    googleClientId,
  });

  // create a React stack that makes use of api and auth resources created in the backend stack.
  new ReactFrontendStack(app, "frontend-stack", {
    api: backend.api,
    auth: backend.auth,
    googleClientId,
    tags,
  });
}
