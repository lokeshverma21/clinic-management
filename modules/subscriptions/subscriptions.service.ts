import {
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@/lib/errors/app-error";
import type { RequestContext } from "@/lib/auth/request-context";
import {
    createCashfreeSubscription,
    manageCashfreeSubscription,
} from "@/lib/cashfree/subscriptions";
import * as subscriptionRepository from "./subscriptions.repository";
import type {
    StartSubscriptionInput,
    StartSubscriptionResult,
    SubscriptionHistoryItem,
    SubscriptionPlanDetails,
} from "./subscriptions.types";

const plans: SubscriptionPlanDetails[] = [
    {
        id: "starter",
        name: "Starter",
        amount: 2999,
        currency: "INR",
        billingCycle: "monthly",
        staffSeatLimit: 5,
        selfServe: true,
    },
    {
        id: "professional",
        name: "Professional",
        amount: 4999,
        currency: "INR",
        billingCycle: "monthly",
        staffSeatLimit: 10,
        selfServe: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        amount: null,
        currency: "INR",
        billingCycle: "monthly",
        staffSeatLimit: null,
        selfServe: false,
    },
];
function assertOwner(ctx: RequestContext): void {
    if (ctx.role !== "owner")
        throw new ForbiddenError(
            "OWNER_ONLY",
            "Only the clinic owner can manage subscriptions",
        );
}
function planFor(
    id: "starter" | "professional",
): SubscriptionPlanDetails & { amount: number; staffSeatLimit: number } {
    const plan = plans.find((candidate) => candidate.id === id);
    if (!plan || plan.amount === null || plan.staffSeatLimit === null)
        throw new ConflictError(
            "PLAN_NOT_SELF_SERVE",
            "This plan requires contacting sales",
        );
    return plan as SubscriptionPlanDetails & {
        amount: number;
        staffSeatLimit: number;
    };
}
export async function listSubscriptionPlans(
    clinicId: string,
    ctx: RequestContext,
): Promise<SubscriptionPlanDetails[]> {
    if (clinicId !== ctx.clinicId)
        throw new ForbiddenError("FORBIDDEN", "Clinic access denied");
    return plans;
}
export async function getCurrentSubscription(
    clinicId: string,
    ctx: RequestContext,
) {
    if (clinicId !== ctx.clinicId)
        throw new ForbiddenError("FORBIDDEN", "Clinic access denied");
    return subscriptionRepository.getSubscription(clinicId);
}
export async function startSubscription(
    clinicId: string,
    ctx: RequestContext,
    input: StartSubscriptionInput,
): Promise<StartSubscriptionResult> {
    assertOwner(ctx);
    if (clinicId !== ctx.clinicId)
        throw new ForbiddenError("FORBIDDEN", "Clinic access denied");
    const plan = planFor(input.plan);
    const current = await subscriptionRepository.getSubscription(clinicId);
    if (current?.status === "active")
        throw new ConflictError(
            "SUBSCRIPTION_ALREADY_ACTIVE",
            "An active subscription already exists",
        );
    const reference = `clinic_${clinicId.replace(/-/g, "")}_${Date.now()}`;
    const response = await createCashfreeSubscription({
        subscription_id: reference,
        customer_details: {
            customer_name: `Clinic ${clinicId}`,
            customer_email: `${clinicId}@clinicos.local`,
            customer_phone: "9999999999",
        },
        plan_details: {
            plan_name: plan.name,
            plan_type: "PERIODIC",
            plan_amount: plan.amount,
            plan_max_amount: plan.amount,
            plan_max_cycles: 0,
            plan_intervals: 1,
            plan_currency: "INR",
            plan_interval_type: "MONTH",
            plan_note: `${plan.name} ClinicOS subscription`,
        },
        authorization_details: {
            authorization_amount: 1,
            authorization_amount_refund: true,
            payment_methods: ["upi", "enach", "card"],
        },
        subscription_meta: {
            return_url: input.returnUrl,
            notification_channel: ["EMAIL"],
        },
        subscription_expiry_time: "2100-01-01T00:00:00+05:30",
        subscription_first_charge_time: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString(),
        subscription_tags: { clinic_id: clinicId },
    });
    const subscription = await subscriptionRepository.upsertSubscription(
        clinicId,
        {
            plan: plan.id,
            staffSeatLimit: plan.staffSeatLimit,
            billingCycle: "monthly",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
            paymentProviderCustomerId: null,
            cashfreeOrderId: response.authorisation_details?.payment_id ?? null,
            cashfreeSubscriptionId: response.subscription_id,
            status: "trialing",
            pausedAt: null,
            cancelledAt: null,
            deletedAt: null,
        },
    );
    return { subscription, sessionId: response.subscription_session_id };
}
export async function manageSubscription(
    clinicId: string,
    ctx: RequestContext,
    action: "pause" | "cancel",
) {
    assertOwner(ctx);
    if (clinicId !== ctx.clinicId)
        throw new ForbiddenError("FORBIDDEN", "Clinic access denied");
    const subscription = await subscriptionRepository.getSubscription(clinicId);
    if (!subscription?.cashfreeSubscriptionId)
        throw new NotFoundError(
            "SUBSCRIPTION_NOT_FOUND",
            "No Cashfree subscription found",
        );
    await manageCashfreeSubscription(
        subscription.cashfreeSubscriptionId,
        action === "pause" ? "PAUSE" : "CANCEL",
    );
    return subscriptionRepository.updateSubscription(
        clinicId,
        action === "pause"
            ? { status: "paused", pausedAt: new Date() }
            : { status: "canceled", cancelledAt: new Date() },
    );
}
export async function listSubscriptionHistory(
    clinicId: string,
    ctx: RequestContext,
): Promise<SubscriptionHistoryItem[]> {
    assertOwner(ctx);
    if (clinicId !== ctx.clinicId)
        throw new ForbiddenError("FORBIDDEN", "Clinic access denied");
    return subscriptionRepository.listWebhookEvents(clinicId);
}
export async function processCashfreeWebhook(
    clinicId: string,
    eventId: string,
    payload: CashfreeWebhookPayload,
): Promise<void> {
    const inserted = await subscriptionRepository.insertWebhookEvent(
        clinicId,
        eventId,
        payload,
        payload.type,
    );
    if (!inserted) return;
    const status = mapStatus(
        payload.data.subscription_details.subscription_status,
    );
    if (!status) return;
    const subscription =
        await subscriptionRepository.getSubscriptionByCashfreeId(
            clinicId,
            payload.data.subscription_details.subscription_id,
        );
    if (!subscription) return;
    await subscriptionRepository.updateSubscription(clinicId, {
        status,
        ...(status === "paused" ? { pausedAt: new Date() } : {}),
        ...(status === "canceled" ? { cancelledAt: new Date() } : {}),
    });
    await subscriptionRepository.updateClinicStatus(
        clinicId,
        status === "active"
            ? "active"
            : status === "past_due"
              ? "past_due"
              : status === "canceled"
                ? "canceled"
                : "suspended",
    );
}
export interface CashfreeWebhookPayload {
    type: string;
    data: {
        subscription_details: {
            subscription_id: string;
            subscription_status: string;
        };
        event_id?: string;
    };
}
export function isCashfreeWebhookPayload(
    value: unknown,
): value is CashfreeWebhookPayload {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { type?: unknown }).type === "string" &&
        typeof (
            value as {
                data?: {
                    subscription_details?: {
                        subscription_id?: unknown;
                        subscription_status?: unknown;
                    };
                };
            }
        ).data?.subscription_details?.subscription_id === "string" &&
        typeof (
            value as {
                data?: {
                    subscription_details?: {
                        subscription_id?: unknown;
                        subscription_status?: unknown;
                    };
                };
            }
        ).data?.subscription_details?.subscription_status === "string"
    );
}
function mapStatus(
    status: string,
): "active" | "past_due" | "paused" | "canceled" | null {
    if (status === "ACTIVE") return "active";
    if (status === "ON_HOLD") return "past_due";
    if (status === "PAUSED" || status === "CUSTOMER_PAUSED") return "paused";
    if (
        [
            "CANCELLED",
            "CUSTOMER_CANCELLED",
            "EXPIRED",
            "COMPLETED",
            "CARD_EXPIRED",
        ].includes(status)
    )
        return "canceled";
    return null;
}
