import { auth } from '@/auth';

export const checkSession = async () => {
  const session = await auth();

  // Check user is authenticated
  if (!session?.user) {
    throw new Error('Not authenticated');
  }
  return session;
};
