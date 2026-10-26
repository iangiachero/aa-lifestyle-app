import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';

const STRIPE_ACTIVE_STATUSES = ['active', 'trialing'];

export function isAnonymousRevenueCatId(id: string) {
  return id.startsWith('$RCAnonymousID:');
}

/*
  Asks RevenueCat "is 'pro' active for this user right now" and writes the
  answer to users.plan. Used by the webhook (any event) and by revenuecat-sync
  (called by the app right after a purchase/restore), so both paths agree.

  Returns the plan written, or null when the lookup failed and nothing was
  changed — a transient API error must never downgrade a paying user.
*/
export async function syncPlanFromRevenueCat(
  supabase: SupabaseClient,
  userId: string,
  reason: string,
): Promise<'pro' | 'free' | null> {
  const projectId = Deno.env.get('REVENUECAT_PROJECT_ID')!;
  const apiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY')!;

  // v2's active_entitlements, not v1's /subscribers: v1 rejects v2-era secret
  // keys outright (403), and v2 only ever returns entitlements that are
  // active right now, so there is no expiry arithmetic to get wrong.
  const res = await fetch(
    `https://api.revenuecat.com/v2/projects/${projectId}` +
    `/customers/${encodeURIComponent(userId)}/active_entitlements`,
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );

  // A customer RevenueCat has never seen is a 404 — a real "no entitlement"
  // answer, not a failed lookup.
  if (!res.ok && res.status !== 404) {
    console.error(`[revenuecat] entitlement fetch failed for ${userId}: ${res.status}`);
    return null;
  }

  const data = res.status === 404 ? { items: [] } : await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  // Any active entitlement means Pro: 'pro' is the app's only entitlement.
  // Matching on the name never worked: this endpoint identifies entitlements
  // by RevenueCat's internal id (entl...), not by the 'pro' lookup key, so
  // every paid purchase was read as "no entitlement" and Pro never unlocked.
  // Resolving the name would need a second call and a key with project-config
  // access; if a second entitlement is ever added, do that instead.
  const appStoreActive = items.length > 0;

  // users.plan is shared with stripe-webhook. An App Store lapse must not take
  // Pro away from someone still paying on the website (e.g. a web subscriber
  // who also restored an Apple purchase onto the same account).
  const plan = appStoreActive || await hasActiveStripeSubscription(supabase, userId) ? 'pro' : 'free';

  // update() reports success even when it matches no row; read the row back
  // so a missing user surfaces as a failure instead of a silent no-op.
  const { data: updated, error } = await supabase
    .from('users')
    .update({ plan })
    .eq('user_id', userId)
    .select('user_id');
  if (error || !updated?.length) {
    console.error(`[revenuecat] failed to update plan for ${userId}:`, error?.message ?? 'no users row');
    return null;
  }
  const ids = items.map((i: Record<string, unknown>) => i?.entitlement_id).join(',') || 'none';
  console.info(`[revenuecat] ${reason}: plan set to '${plan}' for user ${userId} (active: ${ids})`);
  return plan;
}

async function hasActiveStripeSubscription(supabase: SupabaseClient, userId: string) {
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (!customer?.customer_id) return false;

  const { data: sub } = await supabase
    .from('stripe_subscriptions')
    .select('status')
    .eq('customer_id', customer.customer_id)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  return STRIPE_ACTIVE_STATUSES.includes(sub?.status);
}
