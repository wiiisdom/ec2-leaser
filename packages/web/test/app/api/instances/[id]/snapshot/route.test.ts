import { POST } from '@/app/api/instances/[id]/snapshot/route';
import { checkSession } from '@/lib/authUtils';
import { snapshotInstance } from '@/lib/ec2Utils';
import { CreateSnapshotCommandOutput } from '@aws-sdk/client-ec2';
import { expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/ec2Utils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return description when authentication succeeds', async () => {
  vi.mocked(snapshotInstance).mockResolvedValue({
    SnapshotId: 'snapshotId'
  } as CreateSnapshotCommandOutput);

  const response = await POST(
    new Request('http://localhost/api/instances/i-1/snapshot'),
    { params: Promise.resolve({ id: 'i-1' }) }
  );

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual({ snapshotId: 'snapshotId' });

  expect(checkSession).toHaveBeenCalled();
  expect(snapshotInstance).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockImplementation(() => {
    throw authError;
  });

  await expect(
    POST(new Request('http://localhost/api/instances/i-1/snapshot'), {
      params: Promise.resolve({ id: 'i-1' })
    })
  ).rejects.toThrow(authError);

  expect(snapshotInstance).not.toHaveBeenCalled();
});

it('should handle aws failure', async () => {
  vi.mocked(snapshotInstance).mockRejectedValue(new Error('Error'));

  const response = await POST(
    new Request('http://localhost/api/instances/i-1/snapshot'),
    { params: Promise.resolve({ id: 'i-1' }) }
  );

  expect(response.status).toBe(500);
  const responseData = await response.text();
  expect(responseData).toEqual('Error');
});
