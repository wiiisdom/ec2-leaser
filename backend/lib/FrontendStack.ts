import { Bucket } from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

import { DockerImage, RemovalPolicy } from "@aws-cdk/core";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import { PriceClass, ViewerProtocolPolicy } from "@aws-cdk/aws-cloudfront";

import { spawnSync } from "child_process";
import * as fs from "fs-extra";

export class FrontendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // create a S3 bucket to host static asset for the frontend
    const frontendBucket = new Bucket(this, "FrontendBucket", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // add content in our S3 bucket from the frontend/build directory
    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [
        s3deploy.Source.asset("../client", {
          bundling: {
            local: {
              tryBundle(outputDir: string) {
                try {
                  spawnSync("yarn --version");
                } catch {
                  return false;
                }

                spawnSync("yarn && yarn build");

                fs.copySync("../client/build", outputDir);
                return true;
              },
            },
            image: DockerImage.fromRegistry("node:lts"),
            command: [],
          },
        }),
      ],
      destinationBucket: frontendBucket,
    });

    // create CloudFront distribution to serve the content
    const frontendDistribution = new cloudfront.Distribution(
      this,
      "frontendDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(frontendBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        priceClass: PriceClass.PRICE_CLASS_100,
      }
    );

    // Show API endpoint in output
    this.addOutputs({
      BucketName: frontendBucket.bucketName,
      DistributionURL: frontendDistribution.domainName,
    });
  }
}
