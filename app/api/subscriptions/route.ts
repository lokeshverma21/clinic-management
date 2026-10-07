import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { startSubscriptionSchema } from '@/modules/subscriptions/subscriptions.validation';
import { startSubscription } from '@/modules/subscriptions';
export async function POST(request: NextRequest) { try { const ctx = await getRequestContext(); const input = startSubscriptionSchema.parse(await request.json()); return apiSuccess(await startSubscription(ctx.clinicId, ctx, input), 201); } catch (error) { return apiError(error); } }
