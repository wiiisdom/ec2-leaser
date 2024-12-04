import { GET } from '@/app/api/schedules/route';
import { checkSession } from '@/lib/authUtils';
import { getSchedules } from '@/lib/dynamoUtils';
import { beforeEach } from 'vitest';
import { expect, it, vi } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/dynamoUtils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return schedules when authentication succeeds', async () => {
  const mockSchedules = [{ name: 'name', description: 'description' }];
  vi.mocked(getSchedules).mockResolvedValue(mockSchedules);

  const response = await GET();

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual(mockSchedules);

  expect(checkSession).toHaveBeenCalled();
  expect(getSchedules).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockImplementation(() => {
    throw authError;
  });

  await expect(GET()).rejects.toThrow(authError);

  expect(getSchedules).not.toHaveBeenCalled();
});

it('should handle aws failure', async () => {
  const error = new Error('error');
  vi.mocked(getSchedules).mockRejectedValue(error);

  await expect(GET()).rejects.toThrow(error);
});
