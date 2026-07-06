// modules/staff/staff.types.ts
import type { Membership, MembershipRole, StaffProfile, User, WorkingHours } from '@/db/schema';

export type { MembershipRole, WorkingHours };

export interface StaffListItem {
  membershipId: string;
  role: MembershipRole;
  status: Membership['status'];
  invitedEmail: string | null;
  joinedAt: Date | null;
  user: Pick<User, 'id' | 'fullName' | 'email' | 'phone'> | null;
  staffProfile: Pick<StaffProfile, 'specialization' | 'workingHours' | 'colorTag'> | null;
}

export interface InviteStaffInput {
  email: string;
  // Owner is deliberately excluded — Part 7: owner accounts originate
  // only from clinic signup. Promoting someone to owner is a role-change
  // (updateStaff), not an invite.
  role: Exclude<MembershipRole, 'owner'>;
}

export interface UpdateStaffInput {
  role?: MembershipRole;
  specialization?: string | null;
  workingHours?: WorkingHours | null;
  colorTag?: string | null;
}

export interface DeactivateStaffResult {
  membership: Membership;
  // Part 9 edge case: non-zero doesn't block deactivation — it's a
  // warning for the frontend to surface ("reassign or cancel first").
  upcomingAppointmentsCount: number;
}