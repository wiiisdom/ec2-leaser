import { checkSession } from '@/lib/authUtils';
import { getLaunchTemplateLastVersionDescription } from '@/lib/ec2Utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const launchTemplateId = (await params).id;

  await checkSession();

  const description =
    await getLaunchTemplateLastVersionDescription(launchTemplateId);

  return Response.json({
    description
  });
}
