import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { isNativeApp } from './platform';
import { supabase } from './supabase';

/*
  Push registration via @capacitor/push-notifications. Same shape as iap.js:
  every export is a no-op on the web build, where the plugin (and APNs) doesn't
  exist. Tokens land in the device_tokens table; the send-push edge function
  reads them from there.
*/

// The registration listener outlives sign-in/sign-out cycles, so it must not
// close over the user id from whichever call attached it — a second account on
// the same device would silently register tokens under the first user.
let currentUserId = null;
let currentToken = null;
let listenersAttached = false;
// AuthContext calls this from both getSession() and onAuthStateChange, which
// both fire at startup. Two concurrent requestPermissions() calls means iOS
// answers the second one 'denied' (only one system prompt can be shown), and
// that loser used to abort registration. Serialise instead.
let inFlight = null;

/*
  Static import, not import(), and the returned proxy must never cross an
  `await` or any other promise resolution.

  registerPlugin() hands back a Proxy that answers *every* property access with
  a method — including `then`. That makes it look like a thenable, so awaiting
  it (or returning it from an async function) makes the runtime call
  `proxy.then(resolve, reject)`, which dispatches a native call to a method
  named "then" that no plugin implements. Nothing rejects; it simply never
  settles, so the whole registration hangs with no error and no prompt. Call
  sites must take this synchronously.
*/
function getPushSDK() {
  return isNativeApp() ? PushNotifications : null;
}

/** Call after sign-in, once the Supabase user id is known. Safe to call on
 *  every auth change — registration re-runs are cheap and the upsert is
 *  idempotent. */
export function registerPush(userId) {
  if (!inFlight) {
    inFlight = doRegister(userId).finally(() => { inFlight = null; });
  }
  return inFlight;
}

async function doRegister(userId) {
  const PushNotifications = getPushSDK();
  if (!PushNotifications) return;

  currentUserId = userId;

  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') return;

    if (!listenersAttached) {
      listenersAttached = true;
      const platform = Capacitor.getPlatform();

      await PushNotifications.addListener('registration', async ({ value: token }) => {
        currentToken = token;
        if (!currentUserId) return;
        // Upsert on token, not (user_id, token): a device that changes hands
        // must stop notifying the previous account.
        const { error } = await supabase.from('device_tokens').upsert(
          { user_id: currentUserId, token, platform, updated_at: new Date().toISOString() },
          { onConflict: 'token' }
        );
        if (error) console.error('[push] could not save device token', error.message);
      });

      await PushNotifications.addListener('registrationError', (err) => {
        console.error('[push] APNs registration failed', err);
      });
    }

    await PushNotifications.register();
  } catch (err) {
    console.error('[push] registration failed', err);
  }
}

/** Call during sign-out, while the session is still valid — the row delete
 *  needs the outgoing user's RLS identity. */
export async function unregisterPush() {
  currentUserId = null;
  if (!currentToken) return;
  const token = currentToken;
  currentToken = null;
  try {
    await supabase.from('device_tokens').delete().eq('token', token);
  } catch {
    // Best effort: a stale row also gets cleaned up server-side when APNs
    // reports the token dead.
  }
}
