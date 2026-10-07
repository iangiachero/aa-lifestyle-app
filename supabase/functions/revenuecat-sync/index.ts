import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { syncPlanFromRevenueCat } from '../_shared/revenuecat.ts';

/*
  Called by the app right after an App Store purchase or restore, so Pro
  unlocks without depending on the RevenueCat webhook arriving. Only ever
  syncs the caller's own account (from their JWT), and the answer comes from
  RevenueCat's API, so a client can't use this to grant itself Pro.
*/

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: 'Not signed in' }, 401);

    const plan = await syncPlanFromRevenueCat(supabase, user.id, 'APP_SYNC');
    if (!plan) return json({ error: 'Could not reach the App Store right now. Please try again.' }, 502);

    return json({ plan });
  } catch (error) {
    console.error('[revenuecat-sync] unexpected error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
