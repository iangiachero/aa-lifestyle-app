import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

/*
  Mirrors stripe-webhook's approach on purpose: rather than branching on which
  of RevenueCat's ~20 event types arrived (INITIAL_PURCHASE, RENEWAL,
  CANCELLATION, BILLING_ISSUE, REFUND_REVERSED, ...), every event triggers a
  re-fetch of the subscriber's current entitlement state from RevenueCat's API
  and writes that. Trusting each event's implied direction would mean handling
  every type correctly forever; asking "is 'pro' active right now" is the same
  question regardless of what triggered it, and self-heals if an event is ever
  missed or delivered out of order.

  This depends on the app calling Purchases.configure with appUserID set to
  the Supabase user id (see configureRevenueCat in src/lib/iap.js) — that is
  what makes event.app_user_id here the same value as users.user_id.
*/

const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;
const revenueCatApiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY')!;
const revenueCatProjectId = Deno.env.get('REVENUECAT_PROJECT_ID')!;
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const ENTITLEMENT_ID = 'pro';

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    // RevenueCat's simplest verification option: a shared secret configured in
    // the dashboard, sent back on every request. HMAC signing is available for
    // stronger verification if this ever needs it.
    const authHeader = req.headers.get('Authorization') ?? '';
    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.error('[revenuecat-webhook] rejected: bad Authorization header');
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const appUserId = body?.event?.app_user_id;
    const eventType = body?.event?.type;

    if (!appUserId || typeof appUserId !== 'string') {
      console.error('[revenuecat-webhook] no app_user_id on event:', eventType);
      return Response.json({ received: true });
    }

    // An anonymous RevenueCat id (never linked to a Supabase user id) means
    // configureRevenueCat ran without a signed-in user — nothing to sync.
    if (appUserId.startsWith('$RCAnonymousID:')) {
      console.info(`[revenuecat-webhook] ignoring anonymous subscriber for event: ${eventType}`);
      return Response.json({ received: true });
    }

    EdgeRuntime.waitUntil(syncPlanFromRevenueCat(appUserId, eventType));

    return Response.json({ received: true });
  } catch (error) {
    console.error('[revenuecat-webhook] unexpected error:', error);
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});

async function syncPlanFromRevenueCat(userId: string, eventType: string) {
  try {
    // v2's active_entitlements, not v1's /subscribers: v1 rejects v2-era secret
    // keys outright (403), and v2 only ever returns entitlements that are
    // active right now, so there is no expiry arithmetic to get wrong.
    const res = await fetch(
      `https://api.revenuecat.com/v2/projects/${revenueCatProjectId}` +
      `/customers/${encodeURIComponent(userId)}/active_entitlements?expand=items.entitlement`,
      { headers: { Authorization: `Bearer ${revenueCatApiKey}` } },
    );

    // A customer RevenueCat has never seen is a 404, which is a real answer —
    // no active entitlement — not a failure to look up. Anything else is a
    // lookup we can't trust, so leave the current plan alone rather than
    // downgrading a paying user on a transient API error.
    if (!res.ok && res.status !== 404) {
      console.error(`[revenuecat-webhook] entitlement fetch failed for ${userId}: ${res.status}`);
      return;
    }

    const data = res.status === 404 ? { items: [] } : await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    // The id field has carried both the lookup key and the internal entl_ id
    // across API revisions; match on either, plus the expanded object.
    const isActive = items.some((item: Record<string, unknown>) => {
      const expanded = item?.entitlement as Record<string, unknown> | undefined;
      return expanded?.lookup_key === ENTITLEMENT_ID || item?.entitlement_id === ENTITLEMENT_ID;
    });
    const plan = isActive ? 'pro' : 'free';

    const { error } = await supabase.from('users').update({ plan }).eq('user_id', userId);

    if (error) {
      console.error(`[revenuecat-webhook] failed to update plan for ${userId}:`, error.message);
    } else {
      console.info(`[revenuecat-webhook] ${eventType}: plan set to '${plan}' for user ${userId}`);
    }
  } catch (error) {
    console.error(`[revenuecat-webhook] failed syncing user ${userId}:`, error);
  }
}
