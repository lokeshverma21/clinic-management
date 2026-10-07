import type { NextRequest } from 'next/server';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { manageSubscriptionSchema } from '@/modules/subscriptions/subscriptions.validation';
import { manageSubscription } from '@/modules/subscriptions';
export async function POST(request: NextRequest) { try { const ctx = await getRequestContext(); const { action } = manageSubscriptionSchema.parse(await request.json()); return apiSuccess({ subscription: await manageSubscription(ctx.clinicId, ctx, action) }); } catch (error) { return apiError(error); } }
