import { checkSession } from '@/lib/authUtils';
import { snapshotInstance } from '@/lib/ec2Utils';

export const fetchCache = 'force-no-store';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await checkSession();
  try {
    const instanceId = (await params).id;
    const ebsSnapshot = await snapshotInstance(instanceId);
    return Response.json({
      snapshotId: ebsSnapshot.SnapshotId
    });
  } catch (err) {
    return new Response((err as Error).message, { status: 500 });
  }
}
