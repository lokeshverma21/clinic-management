import { getRequestContext } from "@/lib/auth/request-context";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { listSubscriptionPlans } from "@/modules/subscriptions";
export async function GET() {
    try {
        const ctx = await getRequestContext();
        return apiSuccess({
            plans: await listSubscriptionPlans(ctx.clinicId, ctx),
        });
    } catch (error) {
        return apiError(error);
    }
}
