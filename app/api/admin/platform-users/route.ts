// app/api/admin/platform-users/route.ts
import type { NextRequest } from 'next/server';
import { getPlatformContext } from '@/modules/admin/access';
import { listPlatformUsers, addPlatformUser } from '@/modules/admin/platform-users';
import { addPlatformUserSchema } from '@/modules/admin/platform-users/platform-users.validation';
import { apiSuccess, apiError } from '@/lib/api/respond';

export async function GET() {
  try {
    const ctx = await getPlatformContext();
    const users = await listPlatformUsers(ctx);
    return apiSuccess({ users });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getPlatformContext();
    const body: unknown = await request.json();
    const input = addPlatformUserSchema.parse(body);

    const user = await addPlatformUser(ctx, input);
    return apiSuccess({ user }, 201);
  } catch (error) {
    return apiError(error);
  }
}
