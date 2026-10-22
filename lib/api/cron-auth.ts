// lib/api/cron-auth.ts

/**
 * Validates the bearer token against the CRON_SECRET environment variable.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${secret}`;
}
