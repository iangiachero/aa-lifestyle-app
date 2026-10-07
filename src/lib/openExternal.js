import { AppLauncher } from '@capacitor/app-launcher';

// Opens a URL in Safari from the native app. window.open(url, '_system') only
// works synchronously inside the tap; after an await (creating a Stripe
// session) WKWebView drops it without any error, which is why the website
// checkout link did nothing. AppLauncher hands the URL straight to iOS.
export function openExternal(url) {
  return AppLauncher.openUrl({ url });
}
