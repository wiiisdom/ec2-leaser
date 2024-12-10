import { checkSession } from '@/lib/authUtils';
import { replaceInstanceRootVolume } from '@/lib/ec2Utils';

export const fetchCache = 'force-no-store';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await checkSession();

  try {
    const instanceId = (await params).id;
    const result = await replaceInstanceRootVolume(instanceId);
    return Response.json({
      instanceId: result.ReplaceRootVolumeTask?.InstanceId
    });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
