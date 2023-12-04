import { it, expect, describe, vi } from 'vitest';
import { checkSession } from 'src/utils/authUtils';
import { useSession } from 'sst/node/auth';

vi.mock('sst/node/auth', async () => {
  return {
    useSession: vi.fn(),
  };
});

describe('auth util', () => {
  it('checkSession must throw if not auth', async () => {
    vi.mocked(useSession).mockReturnValue({
      type: '',
    });
    expect(() => checkSession()).toThrowError(/Not auth/);
  });
  it('checkSession must pass  if  auth', async () => {
    vi.mocked(useSession).mockReturnValue({
      type: 'user',
    });

    expect(() => checkSession()).not.toThrowError(/Not auth/);
  });
});
