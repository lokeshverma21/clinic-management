import { redirect } from 'next/navigation';

export default async function SubscriptionReturnAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sid = typeof params.sid === 'string' ? params.sid : '';
  redirect(sid ? `/settings/subscription/return?sid=${encodeURIComponent(sid)}` : '/settings/subscription');
}