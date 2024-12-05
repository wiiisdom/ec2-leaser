import { POST } from '@/app/api/instances/route';
import { checkSession } from '@/lib/authUtils';
import { startInstance, StartInstanceInput } from '@/lib/ec2Utils';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/ec2Utils');
vi.mock('@/lib/authUtils');

beforeEach(() => {
  vi.resetAllMocks();
});

const startInstanceInput: StartInstanceInput = {
  launchTemplateId: 'launchTemplateId',
  costCenter: 'costCenter',
  owner: 'owner',
  schedule: 'schedule',
  title: 'title'
};

it('should return instance when authentication succeeds', async () => {
  const mockInstance = {
    InstanceId: 'instanceId',
    PrivateIpAddress: 'privateIpAddress'
  };
  vi.mocked(startInstance).mockResolvedValue(mockInstance);

  const response = await POST(
    new Request('http://localhost/api/instances', {
      method: 'POST',
      body: JSON.stringify(startInstanceInput)
    })
  );

  expect(response.status).toBe(200);
  const responseData = await response.json();
  expect(responseData).toEqual({
    instanceId: 'instanceId',
    privateIp: 'privateIpAddress'
  });

  expect(checkSession).toHaveBeenCalled();
  expect(startInstance).toHaveBeenCalled();
});

it('should handle authentication failure', async () => {
  const authError = new Error('Unauthorized');
  vi.mocked(checkSession).mockImplementation(() => {
    throw authError;
  });

  await expect(
    POST(new Request('http://localhost/api/instances'))
  ).rejects.toThrow(authError);

  expect(startInstance).not.toHaveBeenCalled();
});

it('should handle aws failure', async () => {
  vi.mocked(startInstance).mockRejectedValue(new Error('error'));

  const response = await POST(
    new Request('http://localhost/api/instances', {
      method: 'POST',
      body: JSON.stringify(startInstanceInput)
    })
  );

  expect(response.status).toBe(500);
  const responseData = await response.text();
  expect(responseData).toEqual('error');
});
