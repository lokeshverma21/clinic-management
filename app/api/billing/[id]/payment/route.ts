// app/api/billing/[id]/payment/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { addPaymentSchema } from '@/modules/billing/billing.validation';
import { addInvoicePayment } from '@/modules/billing';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const body = addPaymentSchema.parse(await request.json());
    const invoice = await addInvoicePayment(ctx, id, body.amountPaid, body.paymentMethod);
    return apiSuccess({ invoice });
  } catch (error) {
    return apiError(error);
  }
}
