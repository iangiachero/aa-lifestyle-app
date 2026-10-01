import { isNativeApp } from './platform';

/*
  Local notifications via @capacitor/local-notifications. Every function here
  is a no-op on the web build — the plugin talks to iOS/Android's own
  notification system, which only exists inside the native shell. See
  NOTIFICATIONS_SPEC.md for what still needs building on top of this (the
  actual per-feature scheduling triggers, the preferences UI reading/writing
  notification_preferences, the permission-request moment in onboarding).

  API verified against the installed plugin's own type definitions
  (node_modules/@capacitor/local-notifications, checked 2026-08-24), not
  assumed — in particular that `id` must be a 32-bit int, not a string, and
  that a deep-link payload travels in `extra`.
*/

async function getPlugin() {
  if (!isNativeApp()) return null;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

/**
 * Capacitor notification ids are 32-bit ints; our data uses uuids. This
 * derives a stable, deterministic id from any string key (e.g.
 * `event:${uuid}` or `routine:${uuid}:weekday:3`) so the same logical
 * reminder always maps to the same id — required to update or cancel a
 * previously scheduled notification by recomputing its id rather than
 * having to store it separately.
 */
export function stableNotificationId(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0; // 32-bit signed overflow, intentional
  }
  return Math.abs(hash) || 1;
}

export async function requestNotificationPermission() {
  const plugin = await getPlugin();
  if (!plugin) return false;
  const status = await plugin.requestPermissions();
  return status.display === 'granted';
}

export async function hasNotificationPermission() {
  const plugin = await getPlugin();
  if (!plugin) return false;
  const status = await plugin.checkPermissions();
  return status.display === 'granted';
}

/**
 * One-shot reminder at a specific point in time — calendar events, task due
 * dates, assignment deadlines, meal prep. `extra` carries the deep-link
 * payload, e.g. { type: 'event', id: eventUuid }.
 */
export async function scheduleAt({ key, title, body, at, extra }) {
  const plugin = await getPlugin();
  if (!plugin) return null;
  const id = stableNotificationId(key);
  await plugin.schedule({
    notifications: [{ id, title, body, extra, schedule: { at, allowWhileIdle: true } }],
  });
  return id;
}

/**
 * Repeats weekly on one weekday at a fixed time — routines and home
 * organization categories the user schedules, and the morning/evening daily
 * notifications (pass every day of the week for those, one call per day, or
 * use scheduleDaily below).
 */
export async function scheduleWeekly({ key, title, body, weekday, hour, minute, extra }) {
  const plugin = await getPlugin();
  if (!plugin) return null;
  const id = stableNotificationId(key);
  await plugin.schedule({
    notifications: [{
      id, title, body, extra,
      schedule: { on: { weekday, hour, minute }, allowWhileIdle: true },
    }],
  });
  return id;
}

/** Repeats every day at a fixed time — morning overview, evening reminder. */
export async function scheduleDaily({ key, title, body, hour, minute, extra }) {
  const plugin = await getPlugin();
  if (!plugin) return null;
  const id = stableNotificationId(key);
  await plugin.schedule({
    notifications: [{
      id, title, body, extra,
      schedule: { on: { hour, minute }, allowWhileIdle: true },
    }],
  });
  return id;
}

export async function cancelByKey(key) {
  const plugin = await getPlugin();
  if (!plugin) return;
  await plugin.cancel({ notifications: [{ id: stableNotificationId(key) }] });
}

export async function cancelByKeys(keys) {
  const plugin = await getPlugin();
  if (!plugin || !keys.length) return;
  await plugin.cancel({ notifications: keys.map((key) => ({ id: stableNotificationId(key) })) });
}

/**
 * Registers the tap handler once (call from a top-level component, e.g.
 * App.tsx). `onOpen` receives whatever was passed as `extra` when the
 * notification was scheduled — resolveNotificationRoute turns that into an
 * app route.
 */
export async function onNotificationTapped(onOpen) {
  const plugin = await getPlugin();
  if (!plugin) return () => {};
  const handle = await plugin.addListener('localNotificationActionPerformed', (action) => {
    onOpen(action.notification.extra);
  });
  return () => handle.remove();
}
