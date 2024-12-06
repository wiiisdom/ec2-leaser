import { vi, it, expect } from 'vitest';
import { callApi } from '@/api';

global.fetch = vi.fn();

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
