// /modules/dashboard/dashboard.service.ts
import { NotFoundError } from '@/lib/errors/app-error';
import type { RequestContext } from '@/lib/auth/request-context';
import * as dashboardRepository from './dashboard.repository';
import type { DashboardResponse } from './dashboard.types';

/**
 * getDashboard
 *
 * The single public entry point for the dashboard module.
 *
 * All repository calls are fired in parallel via Promise.all. Because
 * none of the six data sets depends on another, there is no reason to
 * await them sequentially — the total wall-clock time is bounded by the
 * slowest individual query, not their sum.
 *
 * Service responsibilities here:
 *   1. Guard against a missing clinic row. This should never happen for
 *      an authenticated user who passed getRequestContext(), but must be
 *      handled explicitly — a missing clinic is a data-integrity signal,
 *      not a recoverable user error.
 *   2. Assemble parallel results into one typed DashboardResponse.
 *   3. Return plain data only — no formatting, no HTML, no presentation
 *      decisions of any kind.
 */
export async function getDashboard(ctx: RequestContext): Promise<DashboardResponse> {
  const [
    stats,
    todayAppointments,
    upcomingAppointments,
    recentPatients,
    doctorsWorkingToday,
    clinic,
  ] = await Promise.all([
    dashboardRepository.getDashboardStats(ctx.clinicId),
    dashboardRepository.getTodayAppointments(ctx.clinicId),
    dashboardRepository.getUpcomingAppointments(ctx.clinicId),
    dashboardRepository.getRecentPatients(ctx.clinicId),
    dashboardRepository.getDoctorsWorkingToday(ctx.clinicId),
    dashboardRepository.getClinicSummary(ctx.clinicId),
  ]);

  if (!clinic) {
    throw new NotFoundError(
      'CLINIC_NOT_FOUND',
      'No clinic record found for this account. Contact support if this persists.',
    );
  }

  return {
    stats,
    todayAppointments,
    upcomingAppointments,
    recentPatients,
    doctorsWorkingToday,
    clinic,
  };
}