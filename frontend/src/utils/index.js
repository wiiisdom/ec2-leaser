export const amplifyConfig = {
  Auth: {
    mandatorySignIn: true,
    region: process.env.REACT_APP_COGNITO_REGION,
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
    identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID
  },
  API: { 
    endpoints: [
      {
        name: 'main',
        endpoint: process.env.REACT_APP_API,
        region: process.env.REACT_APP_COGNITO_REGION
      }
    ]
  },
  oauth: {
    domain: process.env.REACT_APP_COGNITO_DOMAIN,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: process.env.REACT_APP_PUBLIC_DOMAIN,
    redirectSignOut: process.env.REACT_APP_PUBLIC_DOMAIN,
    responseType: 'code',
  },
};
