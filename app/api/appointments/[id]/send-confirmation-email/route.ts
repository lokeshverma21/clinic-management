import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { sendManualAppointmentConfirmationEmail } from '@/modules/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    await sendManualAppointmentConfirmationEmail(ctx, id);
    return apiSuccess({ sent: true });
  } catch (error) {
    return apiError(error);
  }
}
