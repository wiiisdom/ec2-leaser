import { GET } from '@/app/api/templates/[id]/route';
import { checkSession } from '@/lib/authUtils';
import { getLaunchTemplateLastVersionDescription } from '@/lib/ec2Utils';
import { beforeEach } from 'vitest';
import { expect, it, vi } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/ec2Utils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return description when authentication succeeds', async () => {
  vi.mocked(getLaunchTemplateLastVersionDescription).mockResolvedValue(
    'description'
  );

  const response = await GET(
    new Request('http://localhost/api/templates/lt-1'),
    { params: Promise.resolve({ id: 'lt-1' }) }
  );

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual({ description: 'description' });

  expect(checkSession).toHaveBeenCalled();
  expect(getLaunchTemplateLastVersionDescription).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockImplementation(() => {
    throw authError;
  });

  await expect(
    GET(new Request('http://localhost/api/templates/lt-1'), {
      params: Promise.resolve({ id: 'lt-1' })
    })
  ).rejects.toThrow(authError);

  expect(getLaunchTemplateLastVersionDescription).not.toHaveBeenCalled();
});

it('should handle template listing failure', async () => {
  // Mock template listing failure
  const error = new Error('Failed to get templates');
  vi.mocked(getLaunchTemplateLastVersionDescription).mockRejectedValue(error);

  await expect(
    GET(new Request('http://localhost/api/templates/lt-1'), {
      params: Promise.resolve({ id: 'lt-1' })
    })
  ).rejects.toThrow(error);
});
