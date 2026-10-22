import { NextResponse } from 'next/server';
import { runSubscriptionEnforcement } from '@/modules/admin/enforcement';

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSubscriptionEnforcement();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Subscription enforcement cron failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
