import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify';

/**
 * From https://docs.amplify.aws/lib/auth/advanced/q/platform/js#google-sign-in-react
 * To federated sign in from Google
 * @returns
 */
const SignInWithGoogle = () => {
  useEffect(() => {
    const ga =
      window.gapi && window.gapi.auth2
        ? window.gapi.auth2.getAuthInstance()
        : null;

    if (!ga) createScript();
  });

  const signIn = () => {
    const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn().then(
      googleUser => {
        getAWSCredentials(googleUser);
      },
      error => {
        console.log(error);
      }
    );
  };

  const getAWSCredentials = async googleUser => {
    const { id_token, expires_at } = googleUser.getAuthResponse();
    const profile = googleUser.getBasicProfile();
    let user = {
      email: profile.getEmail(),
      name: profile.getName()
    };

    // the following can provide us the AWS temp credentials but we don't it directly
    await Auth.federatedSignIn('google', { token: id_token, expires_at }, user);
  };

  const createScript = () => {
    // load the Google SDK
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.onload = initGapi;
    document.body.appendChild(script);
  };

  const initGapi = () => {
    // init the Google SDK client
    const g = window.gapi;
    g.load('auth2', function () {
      g.auth2.init({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        // authorized scopes
        scope: 'profile email openid'
      });
    });
  };

  return (
    <div>
      <button
        className="px-6 py-2 text-white text-lg bg-yellow-500 hover:bg-yellow-600 border-0 rounded focus:outline-none"
        onClick={signIn}
      >
        Log in with Google
      </button>
    </div>
  );
};

export default SignInWithGoogle;
