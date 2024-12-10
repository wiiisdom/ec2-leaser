import { GET } from '@/app/api/templates/route';
import { checkSession } from '@/lib/authUtils';
import { listLaunchTemplates } from '@/lib/ec2Utils';
import { beforeEach } from 'vitest';
import { expect, it, vi } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/ec2Utils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return templates when authentication succeeds', async () => {
  const mockTemplates = [
    { id: 'lt-123', name: 'template1', version: 1 },
    { id: 'lt-456', name: 'template2', version: 2 }
  ];
  vi.mocked(listLaunchTemplates).mockResolvedValue(mockTemplates);

  const response = await GET();

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual(mockTemplates);

  expect(checkSession).toHaveBeenCalled();
  expect(listLaunchTemplates).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockRejectedValue(authError);

  await expect(GET()).rejects.toThrow(authError);

  expect(listLaunchTemplates).not.toHaveBeenCalled();
});

it('should handle template listing failure', async () => {
  // Mock template listing failure
  const listError = new Error('Failed to list templates');
  vi.mocked(listLaunchTemplates).mockRejectedValue(listError);

  await expect(GET()).rejects.toThrow(listError);
});
