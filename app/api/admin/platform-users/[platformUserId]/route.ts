// app/api/admin/platform-users/[platformUserId]/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import {
  changePlatformUserRole,
  removePlatformUser,
} from '@/modules/admin/platform-users';
import {
  platformUserIdParamSchema,
  updatePlatformUserRoleSchema,
} from '@/modules/admin/platform-users/platform-users.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

interface RouteContext {
  params: Promise<{ platformUserId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getPlatformContext();
    const resolvedParams = await params;
    const { platformUserId } = platformUserIdParamSchema.parse(resolvedParams);

    const body: unknown = await request.json();
    const input = updatePlatformUserRoleSchema.parse(body);

    const updated = await changePlatformUserRole(ctx, platformUserId, input);
    return apiSuccess({ user: updated });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const ctx = await getPlatformContext();
    const resolvedParams = await params;
    const { platformUserId } = platformUserIdParamSchema.parse(resolvedParams);

    await removePlatformUser(ctx, platformUserId);
    return apiSuccess({ success: true, removedId: platformUserId });
  } catch (error) {
    return apiError(error);
  }
}
