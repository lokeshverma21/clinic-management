// app/api/staff/route.ts
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { listStaff } from '@/modules/staff';

// GET /api/staff — Auth: required, any role (Part 9: everyone can view the staff list).
export async function GET() {
  try {
    const ctx = await getRequestContext();
    const staff = await listStaff(ctx);
    return apiSuccess({ staff });
  } catch (error) {
    return apiError(error);
  }
}