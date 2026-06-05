import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

const resolvedMonthlyPriceId = Deno.env.get('STRIPE_PRICE_ID_MONTHLY') ?? 'price_1T6LhRPlvHtXZlBpd1zUbhWo';
const resolvedYearlyPriceId = Deno.env.get('STRIPE_PRICE_ID_YEARLY') ?? 'price_1TCr5XPlvHtXZlBpqXQ7P8KX';

const keyMode = stripeSecret.startsWith('sk_live') ? 'LIVE' : stripeSecret.startsWith('sk_test') ? 'TEST' : 'UNKNOWN';
console.log(`[startup] Stripe key mode: ${keyMode} | Monthly price: ${resolvedMonthlyPriceId} | Yearly price: ${resolvedYearlyPriceId}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await req.json();
    const { price_id, success_url, cancel_url, mode } = body;

    console.log(`[request] price_id=${price_id} mode=${mode}`);

    const validationError = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (validationError) {
      console.error(`[validation] ${validationError}`);
      return corsResponse({ error: validationError }, 400);
    }

    const VALID_PRICE_IDS = [resolvedMonthlyPriceId, resolvedYearlyPriceId];

    if (!VALID_PRICE_IDS.includes(price_id)) {
      const msg = `Price ID mismatch. Received: "${price_id}" | Accepted: ${VALID_PRICE_IDS.join(', ')}`;
      console.error(`[price_id] ${msg}`);
      return corsResponse({ error: msg }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Missing Authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError) {
      console.error('[auth] getUserError:', getUserError.message);
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    console.log(`[auth] Authenticated user: ${user.id}`);

    const { data: existingCustomer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('[db] Failed to fetch customer:', getCustomerError.message, getCustomerError.code);
      return corsResponse({ error: `Failed to fetch customer: ${getCustomerError.message}` }, 500);
    }

    let customerId: string;

    if (!existingCustomer?.customer_id) {
      console.log(`[stripe] Creating new Stripe customer for user ${user.id}`);

      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });

      console.log(`[stripe] Created customer ${newCustomer.id}`);

      const { data: upsertedCustomer, error: upsertCustomerError } = await supabase
        .from('stripe_customers')
        .upsert(
          { user_id: user.id, customer_id: newCustomer.id },
          { onConflict: 'user_id', ignoreDuplicates: false },
        )
        .select('customer_id')
        .maybeSingle();

      if (upsertCustomerError) {
        console.error('[db] Failed to upsert customer mapping:', upsertCustomerError.message, upsertCustomerError.code);
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (cleanupErr: any) {
          console.error('[stripe] Failed to clean up customer after db error:', cleanupErr.message);
        }
        return corsResponse({ error: `Failed to save customer: ${upsertCustomerError.message}` }, 500);
      }

      customerId = upsertedCustomer?.customer_id ?? newCustomer.id;
      console.log(`[db] Customer mapping saved. customerId=${customerId}`);
    } else {
      customerId = existingCustomer.customer_id;
      console.log(`[db] Using existing customer ${customerId}`);
    }

    if (mode === 'subscription') {
      const { error: subUpsertError } = await supabase
        .from('stripe_subscriptions')
        .upsert(
          { customer_id: customerId, status: 'not_started' },
          { onConflict: 'customer_id', ignoreDuplicates: true },
        );

      if (subUpsertError) {
        console.error('[db] Failed to upsert subscription record:', subUpsertError.message, subUpsertError.code);
        return corsResponse({ error: `Failed to init subscription record: ${subUpsertError.message}` }, 500);
      }
    }

    console.log(`[stripe] Creating checkout session for customer ${customerId}, price ${price_id}`);

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: price_id, quantity: 1 }],
        mode,
        success_url,
        cancel_url,
      });
    } catch (stripeError: any) {
      console.error('[stripe] Checkout session creation failed:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        statusCode: stripeError.statusCode,
      });
      return corsResponse(
        {
          error: stripeError.message,
          stripeType: stripeError.type,
          stripeCode: stripeError.code,
        },
        500,
      );
    }

    console.log(`[stripe] Checkout session created: ${session.id}`);
    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[unhandled]', error.message, error.stack);
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter: ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Parameter ${parameter} must be a string, got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Parameter ${parameter} must be one of: ${expectation.values.join(', ')}`;
      }
    }
  }
  return undefined;
}
