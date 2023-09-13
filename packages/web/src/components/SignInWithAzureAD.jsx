import React from 'react';
import { Auth } from 'aws-amplify';

/**
 * From https://docs.amplify.aws/lib/auth/advanced/q/platform/js#google-sign-in-react
 * To federated sign in from Google
 * @returns
 */
const SignInWithAzureAD = () => {
  const signIn = event => {
    event.preventDefault();
    Auth.federatedSignIn({
      provider: 'AzureAD',
      customState: 'redirect = /'
    }).catch(() => {
      // for sonar
    });
  };

  return (
    <div>
      <button
      data-testid="azure-signin-button"
        className="px-6 py-2 text-white text-lg bg-yellow-500 hover:bg-yellow-600 border-0 rounded focus:outline-none"
        onClick={signIn}
      >
        Log in with Azure
      </button>
    </div>
  );
};

export default SignInWithAzureAD;
