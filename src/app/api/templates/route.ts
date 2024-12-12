import { checkSession } from '@/lib/authUtils';
import { listLaunchTemplates } from '@/lib/ec2Utils';

export const fetchCache = 'force-no-store';

export async function GET() {
  await checkSession();

  const templates = await listLaunchTemplates();
  return Response.json(templates);
}
