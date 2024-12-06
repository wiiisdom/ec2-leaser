import { it, expect, vi } from 'vitest';
import { checkSession } from '@/lib/authUtils';
import { auth } from '@/auth';

vi.mock('@/auth');

it('checkSession must throw if not auth', async () => {
  await expect(() => checkSession()).rejects.toThrowError(/Not auth/);
});

it('checkSession must pass if auth', async () => {
  vi.mocked(auth).mockResolvedValue({ user: { id: '12345' } } as any);
  const session = await checkSession();
  expect(session).toBeDefined();
});
