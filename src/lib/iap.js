import { isNativeApp } from './platform';

/*
  In-App Purchase via RevenueCat. Every function here is a no-op on the web
  build — @revenuecat/purchases-capacitor talks to StoreKit, which only exists
  inside the native shell, so none of this can be exercised until Capacitor's
  iOS platform is added and this runs inside Xcode/a device. See HANDOFF.md for
  the RevenueCat dashboard setup this still needs before it does anything.
*/

const ENTITLEMENT_ID = 'pro';

let configured = false;

async function getPurchasesSDK() {
  if (!isNativeApp()) return null;
  const { Purchases } = await import('@revenuecat/purchases-capacitor');
  return Purchases;
}

/**
 * Call once per signed-in session, after the Supabase user id is known. Using
 * that id as RevenueCat's appUserID means the webhook can update users.plan
 * directly by user_id, with no separate customer-mapping table — the same
 * simplification Stripe's flow doesn't get because Stripe's customer id is its
 * own identifier.
 */
export async function configureRevenueCat(supabaseUserId) {
  const Purchases = await getPurchasesSDK();
  if (!Purchases || configured) return;

  const apiKey = import.meta.env.VITE_REVENUECAT_IOS_API_KEY;
  if (!apiKey) {
    console.error('[iap] VITE_REVENUECAT_IOS_API_KEY is not set — purchases will not work');
    return;
  }

  await Purchases.configure({ apiKey, appUserID: supabaseUserId });
  configured = true;
}

/** Called on sign-out so a second account on the same device never inherits
 *  the previous user's RevenueCat identity or entitlement state. */
export async function logOutRevenueCat() {
  const Purchases = await getPurchasesSDK();
  if (!Purchases || !configured) return;
  try {
    await Purchases.logOut();
  } finally {
    configured = false;
  }
}

/** Returns the current offering's packages, or [] on web / before configure(). */
export async function getOfferings() {
  const Purchases = await getPurchasesSDK();
  if (!Purchases) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg) {
  const Purchases = await getPurchasesSDK();
  if (!Purchases) throw new Error('In-App Purchase is only available in the iOS app.');
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return isEntitled(customerInfo);
}

export async function restorePurchases() {
  const Purchases = await getPurchasesSDK();
  if (!Purchases) throw new Error('In-App Purchase is only available in the iOS app.');
  const { customerInfo } = await Purchases.restorePurchases();
  return isEntitled(customerInfo);
}

export async function hasActiveEntitlement() {
  const Purchases = await getPurchasesSDK();
  if (!Purchases) return false;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return isEntitled(customerInfo);
}

function isEntitled(customerInfo) {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];
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
