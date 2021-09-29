import * as sst from "@serverless-stack/resources";

interface ReactFrontendStackProps extends sst.StackProps {
  api: sst.Api;
  auth: sst.Auth;
  googleClientId: string;
}

export default class ReactFrontendStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: ReactFrontendStackProps) {
    super(scope, id, props);

    const domain = scope.stage === "prod" ? "wiiisdom.com" : `${scope.stage}.wiiisdom.com`;

    const { api, auth, googleClientId } = props;

    // Creates the full address to use as URL
    const siteDomain = scope.name + "." + domain;

    // Handles S3 Bucket creation and deployment, and CloudFront CDN setup (certificate, route53)
    const site = new sst.ReactStaticSite(this, "ReactStaticSite", {
      path: "frontend",
      buildCommand: "yarn && yarn build",
      environment: {
        REACT_APP_API: api.url,
        REACT_APP_COGNITO_REGION: scope.region,
        REACT_APP_GOOGLE_CLIENT_ID: googleClientId,
        REACT_APP_COGNITO_IDENTITY_POOL_ID: auth.cognitoCfnIdentityPool.ref,
      },
      customDomain: {
        domainName: siteDomain,
        hostedZone: domain,
      },
    });

    this.addOutputs({
      SiteUrl: site.customDomainUrl || site.url,
    });
  }
}
