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
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Invalid Patient Identifier</h1>
          <p className="text-sm text-muted-foreground">
            The requested identifier <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{patientId}</code> is not a valid record UUID.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/patients"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <ArrowLeft className="size-4" />
            <span>Back to Patients List</span>
          </Link>
        </div>
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
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <UserX className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Patient Not Found</h1>
            <p className="text-sm text-muted-foreground">
              No active patient record matching this ID exists in your clinic. The record may have been archived or belongs to another clinic.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/patients"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <ArrowLeft className="size-4" />
              <span>Return to Patients</span>
            </Link>
          </div>
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
    <PatientDetailsView
      initialPatient={patient}
      initialAppointments={appointments}
      initialInvoices={invoicesResult.invoices}
      userRole={ctx.role}
      currentMembershipId={ctx.membershipId}
    />
  );
}
