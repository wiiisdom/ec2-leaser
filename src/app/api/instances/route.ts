import { checkSession } from '@/lib/authUtils';
import { startInstance, StartInstanceInput } from '@/lib/ec2Utils';
import { InstanceInfo } from '@/models/Instance';

export async function POST(request: Request) {
  await checkSession();
  try {
    const input = (await request.json()) as StartInstanceInput;

    const instance = await startInstance(input);
    return Response.json({
      instanceId: instance.InstanceId,
      privateIp: instance.PrivateIpAddress
    } as InstanceInfo);
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
