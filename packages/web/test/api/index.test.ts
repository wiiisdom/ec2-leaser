import { describe, vi, it, expect, Mock } from 'vitest';
import { callApi, getUserInfo } from '@/api';

global.fetch = vi.fn() as Mock;

describe('api', () => {
  it('callApi should run a fetch call', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: 'hello'
      })
    } as unknown as Response);
    const result = await callApi('token', '/"');
    expect(result).toEqual({
      message: 'hello'
    });
  });

  it('getUserInfo should run a fetch call', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        userId: 'userId'
      })
    } as unknown as Response);
    const result = await getUserInfo('token');
    expect(result).toEqual({
      token: 'token',
      userId: 'userId'
    });
  });
});
