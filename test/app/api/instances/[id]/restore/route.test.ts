import { POST } from '@/app/api/instances/[id]/restore/route';
import { checkSession } from '@/lib/authUtils';
import { replaceInstanceRootVolume } from '@/lib/ec2Utils';
import { CreateReplaceRootVolumeTaskCommandOutput } from '@aws-sdk/client-ec2';
import { expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/authUtils');
vi.mock('@/lib/ec2Utils');

beforeEach(() => {
  vi.resetAllMocks();
});

it('should return description when authentication succeeds', async () => {
  vi.mocked(replaceInstanceRootVolume).mockResolvedValue({
    ReplaceRootVolumeTask: {
      InstanceId: 'instanceId'
    }
  } as CreateReplaceRootVolumeTaskCommandOutput);

  const response = await POST(
    new Request('http://localhost/api/instances/i-1/restore'),
    { params: Promise.resolve({ id: 'i-1' }) }
  );

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual({ instanceId: 'instanceId' });

  expect(checkSession).toHaveBeenCalled();
  expect(replaceInstanceRootVolume).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockRejectedValue(authError);

  await expect(
    POST(new Request('http://localhost/api/instances/i-1/restore'), {
      params: Promise.resolve({ id: 'i-1' })
    })
  ).rejects.toThrow(authError);

  expect(replaceInstanceRootVolume).not.toHaveBeenCalled();
});

it('should handle aws failure', async () => {
  vi.mocked(replaceInstanceRootVolume).mockRejectedValue(new Error('Error'));

  const response = await POST(
    new Request('http://localhost/api/instances/i-1/restore'),
    { params: Promise.resolve({ id: 'i-1' }) }
  );

  expect(response.status).toBe(500);
  const responseData = await response.text();
  expect(responseData).toEqual('Error');
});
