import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { isAnonymousRevenueCatId, syncPlanFromRevenueCat } from '../_shared/revenuecat.ts';

/*
  Mirrors stripe-webhook's approach on purpose: rather than branching on which
  of RevenueCat's ~20 event types arrived (INITIAL_PURCHASE, RENEWAL,
  CANCELLATION, BILLING_ISSUE, REFUND_REVERSED, ...), every event triggers a
  re-fetch of the subscriber's current entitlement state from RevenueCat's API
  and writes that. Asking "is 'pro' active right now" is the same question
  regardless of what triggered it, and self-heals if an event is ever missed
  or delivered out of order.

  This depends on the app identifying RevenueCat with the Supabase user id
  (configureRevenueCat in src/lib/iap.js) — that is what makes the ids here the
  same values as users.user_id.
*/

const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Which users an event touches. TRANSFER (an App Store purchase moving to a
// different account, e.g. on Restore Purchases) has no app_user_id at all —
// it lists both sides instead, and both need re-syncing: one gains Pro, the
// other loses it. Ignoring it left paying users without Pro.
function affectedUserIds(event: Record<string, unknown>): string[] {
  const ids = event?.type === 'TRANSFER'
    ? [
        ...(Array.isArray(event.transferred_to) ? event.transferred_to : []),
        ...(Array.isArray(event.transferred_from) ? event.transferred_from : []),
      ]
    : [event?.app_user_id];
  return [...new Set(ids)].filter(
    (id): id is string => typeof id === 'string' && id.length > 0 && !isAnonymousRevenueCatId(id),
  );
}

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
    const event = body?.event ?? {};
    const eventType = String(event?.type ?? 'UNKNOWN');
    const userIds = affectedUserIds(event);

    if (userIds.length === 0) {
      // Anonymous ids are never Supabase users — the app identifies RevenueCat
      // before any purchase, so this should only be pre-login noise.
      console.info(`[revenuecat-webhook] no Supabase user on event: ${eventType}`);
      return Response.json({ received: true });
    }

    EdgeRuntime.waitUntil(Promise.all(userIds.map(async (id) => {
      try {
        await syncPlanFromRevenueCat(supabase, id, eventType);
      } catch (error) {
        console.error(`[revenuecat-webhook] failed syncing user ${id}:`, error);
      }
    })));

    return Response.json({ received: true });
  } catch (error) {
    console.error('[revenuecat-webhook] unexpected error:', error);
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
