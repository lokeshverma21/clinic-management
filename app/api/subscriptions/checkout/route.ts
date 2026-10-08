import type { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { subscriptionsService, startSubscriptionSchema } from '@/modules/subscriptions';
import { getRequestContext } from '@/lib/auth/request-context';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { BadRequestError } from '@/lib/errors/app-error';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getRequestContext();
    const body: unknown = await req.json();
    const { plan } = startSubscriptionSchema.parse(body);

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      throw new BadRequestError('EMAIL_REQUIRED', 'Your account needs a primary email address to subscribe');
    }

    const session = await subscriptionsService.startCheckout(ctx, plan, email);
    return apiSuccess(session, 201);
  } catch (error) {
    return apiError(error);
  }
}