// app/api/staff/[membershipId]/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updateStaffSchema } from '@/modules/staff/staff.validation';
import { updateStaff, deactivateStaff } from '@/modules/staff';

interface RouteParams {
  params: Promise<{ membershipId: string }>;
}

// PATCH /api/staff/:membershipId — { role?, specialization?, workingHours?, colorTag? }
// Auth: owner only.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { membershipId } = await params;
    const body = updateStaffSchema.parse(await request.json());
    const membership = await updateStaff(ctx, membershipId, body);
    return apiSuccess({ membership });
  } catch (error) {
    return apiError(error);
  }
}

// DELETE /api/staff/:membershipId — deactivate (never a hard delete).
// Auth: owner only.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { membershipId } = await params;
    const result = await deactivateStaff(ctx, membershipId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}