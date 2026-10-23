// modules/admin/platform-users/platform-users.types.ts
import type { platformRoleEnum } from '@/db/schema';

export type PlatformRole = (typeof platformRoleEnum.enumValues)[number];

export interface PlatformUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: PlatformRole;
  createdAt: Date;
  isCurrentUser: boolean;
}

export interface AddPlatformUserInput {
  email: string;
  role: PlatformRole;
}

export interface UpdatePlatformUserRoleInput {
  role: PlatformRole;
}

export interface ClerkUserLookupResult {
  clerkUserId: string;
  fullName: string;
  email: string;
}
