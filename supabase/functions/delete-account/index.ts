import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

/*
  Permanent account deletion, required by App Store guideline 5.1.1(v): an app
  that lets you create an account must let you delete it from inside the app.

  Order matters. The Stripe subscription is cancelled first — deleting the rows
  while a subscription is still live would keep billing a user who no longer has
  an account, which is the worst possible failure here. Only once billing is
  stopped do we remove the data, and the auth user goes last so a failure
  half-way through leaves an account that can still sign in and retry.
*/

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = stripeSecret ? new Stripe(stripeSecret, { appInfo: { name: 'AA Lifestyle', version: '1.0.0' } }) : null;

// Every table holding rows keyed by user_id. Child tables that cascade from a
// parent are listed too — deleting them directly is harmless and means the
// purge doesn't depend on which foreign keys happen to have ON DELETE CASCADE.
const USER_TABLES = [
  'birthdays',
  'checklist_custom_items',
  'checklist_progress',
  'content_ideas',
  'custom_recipes',
  'events',
  'grocery_items',
  'habits',
  'home_org_categories',
  'lifestyle_modules',
  'lifestyle_routines',
  'lifestyle_steps',
  'meals',
  'notes',
  'organization_tasks',
  'password_vault',
  'shop_items',
  'shopping_items',
  'student_assignments',
  'student_classes',
  'student_custom_blocks',
  'student_exams',
  'student_projects',
  'student_study_sessions',
  'tasks',
  'user_checklists',
  'workout_exercises',
  'workouts',
  'users', // profile row last: the others may reference it
];

const STORAGE_BUCKETS = ['public_user_pfp', 'lifestyle-images'];

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

// A table that was never created, or that has no user_id column, is not a
// failure — it just means this deployment doesn't use it.
function isMissingSchema(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? '';
  const message = error?.message ?? '';
  return code === '42P01' || code === '42703' || code === 'PGRST205' || /does not exist|schema cache/i.test(message);
}

async function cancelStripeSubscriptions(userId: string, report: string[]) {
  if (!stripe) {
    report.push('stripe: no secret key configured, skipped');
    return;
  }
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  const customerId = customer?.customer_id;
  if (!customerId) {
    report.push('stripe: no customer, nothing to cancel');
    return;
  }

  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
  for (const sub of subs.data) {
    if (sub.status === 'canceled' || sub.status === 'incomplete_expired') continue;
    // Cancel immediately rather than at period end: the account is going away
    // now, so leaving it billable until the renewal date would be wrong.
    await stripe.subscriptions.cancel(sub.id);
    report.push(`stripe: cancelled ${sub.id}`);
  }

  // stripe_customers.user_id references auth.users(id) with no ON DELETE
  // CASCADE (checked against the live schema). An earlier version of this
  // function only soft-deleted this row (set deleted_at) to keep billing
  // history — which left the row in place and silently blocked the
  // auth.admin.deleteUser() call below with a foreign-key violation, so
  // deletion always completed the data wipe but never the login itself.
  // stripe_subscriptions/stripe_orders key off customer_id as plain text, not
  // a real foreign key to this table, so removing it doesn't cascade into
  // them or break their history.
  await supabase
    .from('stripe_customers')
    .delete()
    .eq('user_id', userId);
}

async function deleteStorage(userId: string, report: string[]) {
  for (const bucket of STORAGE_BUCKETS) {
    const { data: files, error } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
    if (error) {
      report.push(`storage ${bucket}: ${error.message}`);
      continue;
    }
    if (!files?.length) continue;
    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
    report.push(`storage ${bucket}: ${removeError ? removeError.message : `${paths.length} removed`}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: 'Invalid or expired session' }, 401);

    const report: string[] = [];

    await cancelStripeSubscriptions(user.id, report);
    await deleteStorage(user.id, report);

    for (const table of USER_TABLES) {
      const { error } = await supabase.from(table).delete().eq('user_id', user.id);
      if (error && !isMissingSchema(error)) {
        // Stop rather than press on: the auth user must not be removed while
        // rows that belong to them are still readable.
        console.error(`[delete-account] ${table}: ${error.message}`);
        return json({ error: `Could not delete your ${table} data. Nothing was removed from your login.`, report }, 500);
      }
      if (error) report.push(`${table}: skipped (${error.code})`);
    }

    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error('[delete-account] auth user:', deleteUserError.message);
      return json({ error: 'Your data was removed but the login could not be deleted. Please contact support.', report }, 500);
    }

    console.log(`[delete-account] completed for ${user.id}`, report);
    return json({ success: true });
  } catch (err) {
    console.error('[delete-account] unexpected:', err);
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
