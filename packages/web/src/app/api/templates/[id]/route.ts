import { checkSession } from '@/lib/authUtils';
import { getLaunchTemplateLastVersionDescription } from '@/lib/ec2Utils';

export const fetchCache = 'force-no-store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const launchTemplateId = (await params).id;

  checkSession();

  const description =
    await getLaunchTemplateLastVersionDescription(launchTemplateId);

  return Response.json({
    description
  });
}
