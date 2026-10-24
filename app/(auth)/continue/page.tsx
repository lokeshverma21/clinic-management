import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { findUserByClerkId, listActiveMembershipsForUser } from '@/lib/auth/user-provisioning.repository';
import { getClinicProfile } from '@/modules/clinic-profile';
import { SetupPending } from './setup-pending';
import { NoMembershipView } from './no-membership-view';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Continuing to ClinicSeva | ClinicSeva',
  description: 'Directing you to your clinic workspace.',
};

export default async function ContinuePage() {
  const { isAuthenticated, userId: clerkUserId } = await auth();
  if (!isAuthenticated || !clerkUserId) {
    redirect('/sign-in');
  }

  const user = await findUserByClerkId(clerkUserId);
  if (!user) {
    // Webhook has not finished creating user record in database yet
    return <SetupPending />;
  }

  const activeMemberships = await listActiveMembershipsForUser(user.id);
  if (activeMemberships.length === 0) {
    return <NoMembershipView />;
  }

  const membership = activeMemberships[0];

  // Staff (doctor or receptionist) -> always /dashboard, never onboarding
  if (membership.role === 'doctor' || membership.role === 'receptionist') {
    redirect('/dashboard');
  }

  // Owner -> reuse existing onboarding decision
  const ctx = {
    userId: user.id,
    clerkUserId,
    clinicId: membership.clinicId,
    membershipId: membership.id,
    role: membership.role,
  };

  const clinic = await getClinicProfile(ctx);
  if (!clinic.onboardingCompletedAt) {
    redirect('/onboarding/clinic');
  }

  redirect('/dashboard');
}
