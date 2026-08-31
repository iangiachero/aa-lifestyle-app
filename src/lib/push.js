import { isNativeApp } from './platform';
import { supabase } from './supabase';

/*
  Push registration via @capacitor/push-notifications. Same shape as iap.js:
  every export is a no-op on the web build, where the plugin (and APNs/FCM)
  doesn't exist. Tokens land in the device_tokens table; the send-push edge
  function reads them from there.
*/

// The registration listener outlives sign-in/sign-out cycles, so it must not
// close over the user id from whichever call attached it — a second account on
// the same device would silently register tokens under the first user.
let currentUserId = null;
let currentToken = null;
let listenersAttached = false;

async function getPushSDK() {
  if (!isNativeApp()) return null;
  const { PushNotifications } = await import('@capacitor/push-notifications');
  return PushNotifications;
}

/** Call after sign-in, once the Supabase user id is known. Safe to call on
 *  every auth change — registration re-runs are cheap and the upsert is
 *  idempotent. */
export async function registerPush(userId) {
  const PushNotifications = await getPushSDK();
  if (!PushNotifications) return;

  currentUserId = userId;

  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === 'prompt') {
    perm = await PushNotifications.requestPermissions();
  }
  if (perm.receive !== 'granted') return;

  if (!listenersAttached) {
    listenersAttached = true;
    const { Capacitor } = await import('@capacitor/core');
    const platform = Capacitor.getPlatform();

    await PushNotifications.addListener('registration', async ({ value: token }) => {
      currentToken = token;
      if (!currentUserId) return;
      // Upsert on token, not (user_id, token): a device that changes hands
      // must stop notifying the previous account.
      await supabase.from('device_tokens').upsert(
        { user_id: currentUserId, token, platform, updated_at: new Date().toISOString() },
        { onConflict: 'token' }
      );
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('[push] registration failed', err);
    });
  }

  await PushNotifications.register();
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
    // Best effort: a stale row also gets cleaned up server-side when APNs/FCM
    // reports the token dead.
  }
}
