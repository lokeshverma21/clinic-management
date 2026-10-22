import { platformRoleEnum } from '@/db/schema/enums';

export type PlatformRole = (typeof platformRoleEnum.enumValues)[number];

export interface PlatformContext {
  platformUserId: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  role: PlatformRole;
}
