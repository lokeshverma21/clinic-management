// app/api/billing/[id]/duplicate/route.ts
import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiSuccess, apiError } from '@/lib/api/respond';
import { duplicateDraftInvoice } from '@/modules/billing';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const ctx = await getRequestContext();
    const { id } = await params;
    const invoice = await duplicateDraftInvoice(ctx, id);
    return apiSuccess({ invoice }, 201);
  } catch (error) {
    return apiError(error);
  }
}
