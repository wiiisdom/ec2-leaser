import { useSession } from 'sst/node/auth';

export const checkSession = () => {
  const session = useSession();

  // Check user is authenticated
  if (session.type !== 'user') {
    throw new Error('Not authenticated');
  }
};
