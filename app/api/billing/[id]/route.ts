// app/api/billing/[id]/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { updateInvoiceSchema } from '@/modules/billing/billing.validation';
import { getInvoice, updateInvoice, deleteInvoice } from '@/modules/billing';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const invoice = await getInvoice(ctx, id);
    return apiSuccess({ invoice });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const body = updateInvoiceSchema.parse(await request.json());
    const invoice = await updateInvoice(ctx, id, body);
    return apiSuccess({ invoice });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const invoice = await deleteInvoice(ctx, id);
    return apiSuccess({ invoice });
  } catch (error) {
    return apiError(error);
  }
}
