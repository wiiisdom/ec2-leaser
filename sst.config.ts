import { SSTConfig } from "sst";
import { API } from "./stacks/API";

export default {
  config(_input) {
    return {
      name: "ec2-leaser",
      region: "us-east-1"
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      logRetention: "one_year",
      runtime: "nodejs18.x"
    });
    app.stack(API, {
      id: "backend-stack",
      tags: {
        costcenter: "eng:lab",
        project: "ec2-leaser",
        owner: "lab@wiiisdom.com"
      }
    });
  }
} satisfies SSTConfig;
