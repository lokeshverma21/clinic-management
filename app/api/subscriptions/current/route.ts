import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { getCurrentSubscription, listSubscriptionHistory } from '@/modules/subscriptions';
export async function GET() { try { const ctx = await getRequestContext(); const [subscription, history] = await Promise.all([getCurrentSubscription(ctx.clinicId, ctx), listSubscriptionHistory(ctx.clinicId, ctx)]); return apiSuccess({ subscription, history }); } catch (error) { return apiError(error); } }
