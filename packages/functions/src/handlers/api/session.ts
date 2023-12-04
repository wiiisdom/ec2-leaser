import { ApiHandler } from 'sst/node/api';
import { useSession } from 'sst/node/auth';

export const handler = ApiHandler(async () => {
  const session = useSession();

  // Check user is authenticated
  if (session.type !== 'user') {
    throw new Error('Not authenticated');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ userId: session.properties.userID }),
  };
});
