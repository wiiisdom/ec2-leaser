import { checkSession } from '@/lib/authUtils';
import { getCostCenters } from '@/lib/dynamoUtils';

export async function GET() {
  await checkSession();

  const costCenters = await getCostCenters();
  return Response.json(costCenters);
}
