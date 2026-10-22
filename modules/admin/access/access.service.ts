import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { ForbiddenError, UnauthenticatedError } from '@/lib/errors/app-error';
import { findPlatformUserByClerkId } from './access.repository';
import type { PlatformContext } from './access.types';

export async function getPlatformContext(): Promise<PlatformContext> {
  const { isAuthenticated, userId: clerkUserId } = await auth();

  if (!isAuthenticated || !clerkUserId) {
    throw new UnauthenticatedError('Authentication required');
  }

  const platformUser = await findPlatformUserByClerkId(clerkUserId);

  if (!platformUser) {
    throw new ForbiddenError(
      'NOT_PLATFORM_ADMIN',
      'This account is not authorized as a platform administrator',
    );
  }

  return {
    platformUserId: platformUser.id,
    clerkUserId: platformUser.clerkUserId,
    email: platformUser.email,
    fullName: platformUser.fullName,
    role: platformUser.role,
  };
}

export function assertSuperAdmin(ctx: PlatformContext): void {
  if (ctx.role !== 'super_admin') {
    throw new ForbiddenError(
      'SUPER_ADMIN_ONLY',
      'This operation requires super admin privileges',
    );
  }
}

export function assertCanWrite(ctx: PlatformContext): void {
  if (ctx.role !== 'super_admin') {
    throw new ForbiddenError(
      'WRITE_FORBIDDEN',
      'Platform support accounts have read-only permissions',
    );
  }
}
