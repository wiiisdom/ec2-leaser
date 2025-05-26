import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { Resource } from 'sst';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: Resource.AzureClientId.value,
      clientSecret: Resource.AzureClientSecret.value,
      issuer: `https://login.microsoftonline.com/${Resource.AzureTenantId.value}/v2.0`
    })
  ],
  trustHost: true,
  secret: Resource.AuthSecret.value
});
