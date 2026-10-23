import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, UserX, AlertCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getRequestContext } from '@/lib/auth/request-context';
import { getPatient } from '@/modules/patients';
import { listAppointmentsForPatient } from '@/modules/appointments';
import { listInvoices } from '@/modules/billing';
import { PatientDetailsView } from '@/modules/patients/components/patient-details-view';
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state';
import { NotFoundError } from '@/lib/errors/app-error';

interface PatientPageProps {
  params: Promise<{ patientId: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PatientPageProps): Promise<Metadata> {
  const { patientId } = await params;
  if (!UUID_REGEX.test(patientId)) {
    return { title: 'Invalid Patient | ClinicSeva' };
  }

  try {
    const ctx = await getRequestContext();
    const patient = await getPatient(ctx, patientId);
    return {
      title: `${patient.fullName} | Patient Details - ClinicSeva`,
      description: `Medical history, contact details, and appointment records for ${patient.fullName}.`,
    };
  } catch {
    return {
      title: 'Patient Profile | ClinicSeva',
    };
  }
}

export default async function PatientDetailsPage({ params }: PatientPageProps) {
  const { patientId } = await params;

  // 1. Validate route parameter format
  if (!UUID_REGEX.test(patientId)) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <DashboardEmptyState
          icon={AlertCircle}
          title="Invalid patient identifier"
          description={`The requested identifier "${patientId}" is not a valid patient UUID.`}
          action={
            <Link
              href="/patients"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 h-9 text-xs")}
            >
              <ArrowLeft className="size-4" />
              <span>Back to patients</span>
            </Link>
          }
        />
      </div>
    );
  }

  // 2. Resolve authenticated user and tenant context
  const ctx = await getRequestContext();

  // 3. Query patient record with strict clinic scoping
  let patient;
  try {
    patient = await getPatient(ctx, patientId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <DashboardEmptyState
            icon={UserX}
            title="Patient not found"
            description="No active patient record matching this ID exists in your clinic. The record may have been archived or belongs to another clinic."
            action={
              <Link
                href="/patients"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 h-9 text-xs")}
              >
                <ArrowLeft className="size-4" />
                <span>Return to patients</span>
              </Link>
            }
          />
        </div>
      );
    }
    throw error;
  }

  // 4. Parallel fetch related data (appointments and billing) scoped to this clinic & patient
  const [appointments, invoicesResult] = await Promise.all([
    listAppointmentsForPatient(ctx, patientId),
    listInvoices(ctx, { patientId, page: 1, pageSize: 50 }),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <PatientDetailsView
        initialPatient={patient}
        initialAppointments={appointments}
        initialInvoices={invoicesResult.invoices}
        userRole={ctx.role}
        currentMembershipId={ctx.membershipId}
      />
    </div>
  );
}
