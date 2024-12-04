import { it, expect, vi } from 'vitest';
import { Session } from 'sst/node/auth';
import { checkSession } from '@/lib/authUtils';

vi.mock('next/headers', () => ({
  headers: () => ({
    get: vi.fn().mockReturnValue('test 12345')
  })
}));

it('checkSession must throw if not auth', async () => {
  expect(() => checkSession()).toThrowError(/Not auth/);
});

it('checkSession must pass  if  auth', async () => {
  vi.spyOn(Session, 'verify').mockImplementation(() => ({
    type: 'user',
    properties: {
      userId: 'XXXXX'
    }
  }));

  expect(() => checkSession()).not.toThrowError(/Not auth/);
});
