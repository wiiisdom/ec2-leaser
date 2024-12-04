import { GET } from '@/app/api/costcenters/route';
import { checkSession } from '@/lib/authUtils';
import { getCostCenters } from '@/lib/dynamoUtils';
import { beforeEach } from 'vitest';
import { expect, it, vi } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/dynamoUtils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return costcenters when authentication succeeds', async () => {
  const mockCostCenters = [{ name: 'name', description: 'description' }];
  vi.mocked(getCostCenters).mockResolvedValue(mockCostCenters);

  const response = await GET();

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual(mockCostCenters);

  expect(checkSession).toHaveBeenCalled();
  expect(getCostCenters).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockImplementation(() => {
    throw authError;
  });

  await expect(GET()).rejects.toThrow(authError);

  expect(getCostCenters).not.toHaveBeenCalled();
});

it('should handle aws failure', async () => {
  const error = new Error('error');
  vi.mocked(getCostCenters).mockRejectedValue(error);

  await expect(GET()).rejects.toThrow(error);
});
