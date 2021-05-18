import BackendStack from "./BackendStack";
import * as sst from "@serverless-stack/resources";

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x",
  });

  new BackendStack(app, "backend-stack", {
    tags: {
      costcenter: "360lab",
      owner: "360lab@360suite.io",
    },
  });

  // Add more stacks
}
