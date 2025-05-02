import { checkSession } from '@/lib/authUtils';
import { getSchedules } from '@/lib/dynamoUtils';

export async function GET() {
  await checkSession();

  const schedules = await getSchedules();
  return Response.json(schedules);
}
