// app/api/staff/invite/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { inviteStaffSchema } from '@/modules/staff/staff.validation';
import { inviteStaff } from '@/modules/staff';

// POST /api/staff/invite — { email, role } — Auth: owner only.
export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = inviteStaffSchema.parse(await request.json());
    const membership = await inviteStaff(ctx, body);
    return apiSuccess({ membership }, 201);
  } catch (error) {
    return apiError(error);
  }
}