import { AuthHandler, OauthAdapter, Session } from 'sst/node/auth';
import { Issuer } from 'openid-client';
import { Config } from 'sst/node/config';

declare module 'sst/node/auth' {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}

export const handler = AuthHandler({
  providers: {
    azure: OauthAdapter({
      issuer: await Issuer.discover(
        `https://login.microsoftonline.com/${Config.AZURE_TENANT_ID}/v2.0`
      ),
      clientID: Config.AZURE_CLIENT_ID,
      clientSecret: Config.AZURE_CLIENT_SECRET,
      scope: 'email openid profile',
      onSuccess: async tokenset => {
        const claims = tokenset.claims();
        return Session.parameter({
          redirect: process.env.IS_LOCAL ? 'http://localhost:3000' : Config.SITE_URL,
          type: 'user',
          properties: {
            userID: claims.email!,
          },
        });
      },
    }),
  },
});
