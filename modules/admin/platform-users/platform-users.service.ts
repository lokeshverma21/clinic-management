// modules/admin/platform-users/platform-users.service.ts
import 'server-only';
import { db } from '@/db/client';
import { assertSuperAdmin, type PlatformContext } from '@/modules/admin/access';
import { recordAdminAction } from '@/modules/admin/audit-logs';
import { findClerkUserByEmail } from './platform-users.gateway';
import * as repo from './platform-users.repository';
import type {
  PlatformUserListItem,
  AddPlatformUserInput,
  UpdatePlatformUserRoleInput,
} from './platform-users.types';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from '@/lib/errors/app-error';

/**
 * Returns all platform administrator and support team members.
 * Permitted for both `super_admin` and `support` platform roles.
 */
export async function listPlatformUsers(
  ctx: PlatformContext,
): Promise<PlatformUserListItem[]> {
  const users = await repo.listPlatformUsers();

  return users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    isCurrentUser: u.id === ctx.platformUserId,
  }));
}

/**
 * Adds an existing verified Clerk user to the platform administrator team.
 * Permitted for `super_admin` only.
 */
export async function addPlatformUser(
  ctx: PlatformContext,
  input: AddPlatformUserInput,
): Promise<PlatformUserListItem> {
  assertSuperAdmin(ctx);

  const normalizedInputEmail = input.email.trim().toLowerCase();
  const existingByInputEmail = await repo.findPlatformUserByEmailOrClerkId(
    normalizedInputEmail,
    '',
  );
  if (existingByInputEmail) {
    throw new ConflictError(
      'ALREADY_PLATFORM_ADMIN',
      'This user is already a platform administrator.',
    );
  }

  const clerkUser = await findClerkUserByEmail(normalizedInputEmail);
  if (!clerkUser) {
    throw new NotFoundError(
      'CLERK_USER_NOT_FOUND',
      'No verified ClinicSeva account found for this email. Ask them to sign up first.',
    );
  }

  const existing = await repo.findPlatformUserByEmailOrClerkId(
    clerkUser.email,
    clerkUser.clerkUserId,
  );
  if (existing) {
    throw new ConflictError(
      'ALREADY_PLATFORM_ADMIN',
      'This user is already a platform administrator.',
    );
  }

  return db.transaction(async (tx) => {
    const created = await repo.insertPlatformUser(
      {
        clerkUserId: clerkUser.clerkUserId,
        fullName: clerkUser.fullName,
        email: clerkUser.email,
        role: input.role,
      },
      tx,
    );

    await recordAdminAction(
      ctx,
      {
        action: 'platform_user.added',
        targetType: 'platform_user',
        targetId: created.id,
        metadata: {
          email: created.email,
          role: created.role,
        },
      },
      tx,
    );

    return {
      id: created.id,
      fullName: created.fullName,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
      isCurrentUser: false,
    };
  });
}

/**
 * Updates a platform team member's role (e.g. promoting support to super_admin).
 * Permitted for `super_admin` only.
 */
export async function changePlatformUserRole(
  ctx: PlatformContext,
  platformUserId: string,
  input: UpdatePlatformUserRoleInput,
): Promise<PlatformUserListItem> {
  assertSuperAdmin(ctx);

  return db.transaction(async (tx) => {
    const target = await repo.getPlatformUserById(platformUserId, tx);
    if (!target) {
      throw new NotFoundError('PLATFORM_USER_NOT_FOUND', 'Platform user not found.');
    }

    if (target.id === ctx.platformUserId) {
      throw new ForbiddenError(
        'CANNOT_MODIFY_SELF',
        'You cannot modify your own platform admin role.',
      );
    }

    if (target.role === input.role) {
      throw new BadRequestError(
        'ROLE_UNCHANGED',
        'The platform user already has this role.',
      );
    }

    if (target.role === 'super_admin' && input.role !== 'super_admin') {
      const superAdminCount = await repo.countSuperAdmins(tx, true);
      if (superAdminCount <= 1) {
        throw new ConflictError(
          'LAST_SUPER_ADMIN',
          'Cannot modify the last remaining super admin.',
        );
      }
    }

    const updated = await repo.updatePlatformUserRole(platformUserId, input.role, tx);

    await recordAdminAction(
      ctx,
      {
        action: 'platform_user.role_changed',
        targetType: 'platform_user',
        targetId: updated.id,
        metadata: {
          email: updated.email,
          previousRole: target.role,
          newRole: updated.role,
        },
      },
      tx,
    );

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
      isCurrentUser: false,
    };
  });
}

/**
 * Removes a platform team member's admin access.
 * Permitted for `super_admin` only.
 */
export async function removePlatformUser(
  ctx: PlatformContext,
  platformUserId: string,
): Promise<void> {
  assertSuperAdmin(ctx);

  await db.transaction(async (tx) => {
    const target = await repo.getPlatformUserById(platformUserId, tx);
    if (!target) {
      throw new NotFoundError('PLATFORM_USER_NOT_FOUND', 'Platform user not found.');
    }

    if (target.id === ctx.platformUserId) {
      throw new ForbiddenError(
        'CANNOT_MODIFY_SELF',
        'You cannot remove your own platform admin account.',
      );
    }

    if (target.role === 'super_admin') {
      const superAdminCount = await repo.countSuperAdmins(tx, true);
      if (superAdminCount <= 1) {
        throw new ConflictError(
          'LAST_SUPER_ADMIN',
          'Cannot remove the last remaining super admin.',
        );
      }
    }

    await repo.deletePlatformUser(platformUserId, tx);

    await recordAdminAction(
      ctx,
      {
        action: 'platform_user.removed',
        targetType: 'platform_user',
        targetId: target.id,
        metadata: {
          email: target.email,
          role: target.role,
        },
      },
      tx,
    );
  });
}
