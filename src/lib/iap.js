import { Purchases } from '@revenuecat/purchases-capacitor';
import { isNativeApp } from './platform';

/*
  In-App Purchase via RevenueCat. Every function here is a no-op on the web
  build — @revenuecat/purchases-capacitor talks to StoreKit, which only exists
  inside the native shell, so none of this can be exercised until Capacitor's
  iOS platform is added and this runs inside Xcode/a device. See HANDOFF.md for
  the RevenueCat dashboard setup this still needs before it does anything.
*/

const ENTITLEMENT_ID = 'pro';

// configure() may only run once per app launch; every later account switch
// must go through logIn(). Re-running configure() after a sign-out left the
// SDK on the anonymous id logOut() generated, so the next account's purchase
// was recorded against nobody and Pro never unlocked.
let configured = false;
let currentAppUserId = null;
// Auth fires configure from both getSession and onAuthStateChange without
// awaiting; serialising keeps two calls from racing into configure() twice.
let identityQueue = Promise.resolve();

function serialise(task) {
  const run = identityQueue.then(task, task);
  identityQueue = run.catch(() => {});
  return run;
}

// Static import, and the result must never be awaited — see the long note on
// getPushSDK in push.js. registerPlugin returns a Proxy that answers `then`
// with a function, so awaiting it makes the runtime treat it as a thenable and
// dispatch a native "then" call that never settles. Every call site below
// takes it synchronously.
function getPurchasesSDK() {
  return isNativeApp() ? Purchases : null;
}

/**
 * Call once per signed-in session, after the Supabase user id is known. Using
 * that id as RevenueCat's appUserID means the webhook can update users.plan
 * directly by user_id, with no separate customer-mapping table — the same
 * simplification Stripe's flow doesn't get because Stripe's customer id is its
 * own identifier.
 */
export function configureRevenueCat(supabaseUserId) {
  return serialise(async () => {
    const Purchases = getPurchasesSDK();
    if (!Purchases || !supabaseUserId || currentAppUserId === supabaseUserId) return;

    if (!configured) {
      const apiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
      if (!apiKey) {
        console.error('[iap] VITE_REVENUECAT_IOS_API_KEY is not set — purchases will not work');
        return;
      }
      await Purchases.configure({ apiKey, appUserID: supabaseUserId });
      configured = true;
    } else {
      await Purchases.logIn({ appUserID: supabaseUserId });
    }
    currentAppUserId = supabaseUserId;
  });
}

/** Called on sign-out so a second account on the same device never inherits
 *  the previous user's RevenueCat identity or entitlement state. */
export function logOutRevenueCat() {
  return serialise(async () => {
    const Purchases = getPurchasesSDK();
    if (!Purchases || !configured || !currentAppUserId) return;
    currentAppUserId = null;
    try {
      await Purchases.logOut();
    } catch (err) {
      console.error('[iap] logOut:', err);
    }
  });
}

/** Returns the current offering's packages, or [] on web / before configure(). */
export async function getOfferings() {
  const Purchases = getPurchasesSDK();
  if (!Purchases) return [];
  await identityQueue;
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

// A purchase must land on the signed-in Supabase user, never on an anonymous
// or previous account — the webhook can only unlock Pro for a real user id.
async function ensureIdentity(supabaseUserId) {
  await configureRevenueCat(supabaseUserId);
  if (currentAppUserId !== supabaseUserId) {
    throw new Error('Could not connect to the App Store. Please try again.');
  }
}

export async function purchasePackage(pkg, supabaseUserId) {
  const Purchases = getPurchasesSDK();
  if (!Purchases) throw new Error('In-App Purchase is only available in the iOS app.');
  await ensureIdentity(supabaseUserId);
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return isEntitled(customerInfo);
}

export async function restorePurchases(supabaseUserId) {
  const Purchases = getPurchasesSDK();
  if (!Purchases) throw new Error('In-App Purchase is only available in the iOS app.');
  await ensureIdentity(supabaseUserId);
  const { customerInfo } = await Purchases.restorePurchases();
  return isEntitled(customerInfo);
}

export async function hasActiveEntitlement() {
  const Purchases = getPurchasesSDK();
  if (!Purchases || !configured) return false;
  await identityQueue;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return isEntitled(customerInfo);
}

/**
 * Asks the server to re-read this user's entitlement from RevenueCat and write
 * users.plan. The webhook does the same, but it can arrive late or not at all
 * (e.g. App Store transfers between accounts), so the app never relies on it
 * alone after a purchase or restore.
 */
export async function syncPlanWithServer(accessToken) {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/revenuecat-sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not activate your Pro plan.');
  return data.plan;
}

function isEntitled(customerInfo) {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
}

/**
 * Whether the signed-in App Store account is on the US storefront. Since the
 * May 2025 Epic v. Apple order, US-storefront apps may link out to an external
 * web checkout — but ONLY the US storefront, so showing the link to anyone
 * else is a rejection. Storefront comes from StoreKit via RevenueCat, not from
 * device locale, which is what App Review actually checks. Fails closed: any
 * doubt (web build, not configured, API error) means "not US" and no link.
 */
export async function isUSAppStoreStorefront() {
  const Purchases = getPurchasesSDK();
  if (!Purchases || !configured) return false;
  try {
    const storefront = await Purchases.getStorefront();
    const code = storefront?.countryCode ?? storefront?.storefront?.countryCode;
    return code === 'USA' || code === 'US';
  } catch {
    return false;
  }
}

/**
 * Stripe's billing portal has no idea an App Store purchase exists, so native
 * Pro users need a different place to manage or cancel. RevenueCat's Capacitor
 * plugin has no direct "open subscription management" call — verified against
 * its published API (github.com/RevenueCat/purchases-capacitor, checked
 * 2026-08-19) — so this opens Apple's own subscriptions page instead, which is
 * the standard way apps hand this off on iOS regardless of billing provider.
 */
export function openNativeManageSubscriptions() {
  window.open('https://apps.apple.com/account/subscriptions', '_system');
}
