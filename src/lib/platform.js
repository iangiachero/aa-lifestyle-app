/*
  Where the app is running. Deliberately reads the global Capacitor injects at
  runtime rather than importing @capacitor/core, so this keeps working on the
  web build where that package isn't installed at all.
*/

export function isNativeApp() {
  if (typeof window === 'undefined') return false;
  const cap = window.Capacitor;
  return typeof cap?.isNativePlatform === 'function' ? cap.isNativePlatform() === true : false;
}

/*
  App Store guideline 3.1.1: a subscription unlocking in-app content must go
  through In-App Purchase. Showing the Stripe checkout inside the iOS build is a
  rejection, so it is gated off here.

  This is not the finished state — it hides the web checkout without yet
  offering a native one. In-App Purchase has to be wired up (RevenueCat or
  StoreKit) before the app can be submitted, and this flag is where that
  alternative belongs.
*/
export function canUseWebCheckout() {
  return !isNativeApp();
}
