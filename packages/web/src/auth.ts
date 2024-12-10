import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { Config } from 'sst/node/config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: Config.AZURE_CLIENT_ID,
      clientSecret: Config.AZURE_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${Config.AZURE_TENANT_ID}/v2.0`
    })
  ],
  trustHost: true,
  secret: Config.AUTH_SECRET
});
