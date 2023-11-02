import { MouseEvent } from 'react';
import { Auth } from 'aws-amplify';

/**
 * From https://docs.amplify.aws/lib/auth/advanced/q/platform/js#google-sign-in-react
 * To federated sign in from Google
 * @returns
 */
const SignInWithGoogle = () => {
  const signIn = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    Auth.federatedSignIn({
      customProvider: 'Google',
      customState: 'redirect = /'
    }).catch(() => {
      // for sonar
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
