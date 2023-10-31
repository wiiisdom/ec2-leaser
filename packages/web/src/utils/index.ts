export const amplifyConfig = {
  Auth: {
    mandatorySignIn: true,
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
    identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID
  },
  API: {
    endpoints: [
      {
        name: 'main',
        endpoint: import.meta.env.VITE_API,
        region: import.meta.env.VITE_COGNITO_REGION
      }
    ]
  },
  oauth: {
    domain: import.meta.env.VITE_COGNITO_DOMAIN,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: import.meta.env.VITE_PUBLIC_DOMAIN,
    redirectSignOut: import.meta.env.VITE_PUBLIC_DOMAIN,
    responseType: 'code'
  }
};
