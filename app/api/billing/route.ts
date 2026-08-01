// app/api/billing/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { listInvoicesQuerySchema, createInvoiceSchema } from '@/modules/billing/billing.validation';
import { listInvoices, createInvoice } from '@/modules/billing';

export async function GET(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const query = listInvoicesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listInvoices(ctx, query);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body = createInvoiceSchema.parse(await request.json());
    const invoice = await createInvoice(ctx, body);
    return apiSuccess({ invoice }, 201);
  } catch (error) {
    return apiError(error);
  }
}
