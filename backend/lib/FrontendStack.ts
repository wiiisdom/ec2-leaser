import { Bucket } from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

import { RemovalPolicy } from "@aws-cdk/core";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as route53 from "@aws-cdk/aws-route53";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import { PriceClass, ViewerProtocolPolicy } from "@aws-cdk/aws-cloudfront";

interface FrontendStackProps extends sst.StackProps {
  readonly domain: string;
  readonly subDomain: string;
  //readonly googleClientId: string;
}
export default class FrontendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // create a S3 bucket to host static asset for the frontend
    const frontendBucket = new Bucket(this, "FrontendBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      // following is not working ?
      //autoDeleteObjects: true,
    });

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domain,
    });

    const siteDomain = props.subDomain + "." + props.domain;

    // TLS certificate
    const certificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: siteDomain,
      hostedZone: zone,
      region: "us-east-1", // Cloudfront only checks this region for certificates.
    });

    // create CloudFront distribution to serve the content
    const frontendDistribution = new cloudfront.Distribution(this, "frontendDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      domainNames: [siteDomain],
      certificate: certificate,
      priceClass: PriceClass.PRICE_CLASS_100,
    });

    new route53.ARecord(this, "ARecord", {
      zone: zone,
      recordName: props.subDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(frontendDistribution)),
    });

    // add content in our S3 bucket from the frontend/build directory
    // it will also invalidate the CF distribution (passing distribution)
    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [s3deploy.Source.asset("../client/build")],
      destinationBucket: frontendBucket,
      distribution: frontendDistribution,
    });

    // Show API endpoint in output
    this.addOutputs({
      BucketName: frontendBucket.bucketName,
      DistributionURL: frontendDistribution.domainName,
      DistributionID: frontendDistribution.distributionId,
      URL: "https://" + siteDomain,
    });
  }
}
