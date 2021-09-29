export const amplifyConfig = {
  Auth: {
    mandatorySignIn: true,
    region: process.env.REACT_APP_COGNITO_REGION,
    userPoolId: 'XX-XXXX-X_abcd1234',
    userPoolWebClientId: 'none',
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
  }
};
