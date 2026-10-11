// api/cron/process-notifications/route.ts
import { NextResponse } from 'next/server';
import { processDueNotifications } from '@/modules/notifications';

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
    const result = await processDueNotifications();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Notification cron failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
