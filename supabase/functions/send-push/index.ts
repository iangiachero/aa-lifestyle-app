// Scheduled push dispatcher. Invoke every 15 minutes (Supabase dashboard →
// Edge Functions → send-push → Schedules, or pg_cron + pg_net). Each run:
//
//   1. loads every user who has at least one device token
//   2. computes that user's local wall-clock time from users.timezone
//   3. fires whichever reminder rules match the current window:
//        event_reminder  — an event starts within the next 30 minutes
//        birthday        — 9am local, per birthday person
//        task_digest     — 9am local, "N tasks due today"
//        student_digest  — 5pm local, assignments/exams due tomorrow
//   4. dedups through push_log's UNIQUE constraint — the INSERT is the lock,
//      so overlapping cron runs can't double-send
//
// Delivery is APNs over HTTP/2 (ES256 JWT, no SDK needed). Android goes via
// FCM v1 only when FCM_SERVICE_ACCOUNT is configured; otherwise android
// tokens are skipped, not errored — iOS ships first.
//
// Secrets (supabase secrets set):
//   PUSH_CRON_SECRET   caller must present this in x-cron-secret
//   APNS_KEY_ID        from the .p8 key in the Apple developer portal
//   APNS_TEAM_ID       Apple team id (P5RNX98XJP)
//   APNS_PRIVATE_KEY   full contents of the AuthKey_*.p8 file
//   APNS_TOPIC         bundle id, defaults to com.aalifestyle.app
//   APNS_ENV           'production' (default) or 'sandbox' for dev builds
//   FCM_SERVICE_ACCOUNT  optional — Firebase service-account JSON, one line

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ---------------------------------------------------------------- utilities

function pemToDer(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function b64url(data: Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Local wall-clock fields for a tz like "America/Chicago". Falls back to UTC
// on a missing/invalid tz rather than skipping the user entirely.
function localNow(timezone: string | null) {
  let tz = timezone || 'UTC';
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
  } catch {
    tz = 'UTC';
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const hour = parseInt(get('hour'), 10);
  const minute = parseInt(get('minute'), 10);
  const tomorrow = new Date(Date.parse(`${date}T12:00:00Z`) + 86_400_000)
    .toISOString().slice(0, 10);
  return { date, tomorrow, hour, minute, minutesOfDay: hour * 60 + minute };
}

// ---------------------------------------------------------------- APNs

let apnsJwt: { token: string; issuedAt: number } | null = null;

async function getApnsJwt(): Promise<string> {
  // Apple rejects tokens older than 1h and asks for refresh no more often
  // than every 20 min — reuse for 40.
  if (apnsJwt && Date.now() - apnsJwt.issuedAt < 40 * 60_000) return apnsJwt.token;

  const keyId = Deno.env.get('APNS_KEY_ID')!;
  const teamId = Deno.env.get('APNS_TEAM_ID')!;
  const pem = Deno.env.get('APNS_PRIVATE_KEY')!;

  const key = await crypto.subtle.importKey(
    'pkcs8', pemToDer(pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );

  const header = b64url(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const claims = b64url(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }));
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  const token = `${header}.${claims}.${b64url(new Uint8Array(sig))}`;
  apnsJwt = { token, issuedAt: Date.now() };
  return token;
}

async function sendApns(token: string, title: string, body: string): Promise<'ok' | 'dead' | 'error'> {
  const host = Deno.env.get('APNS_ENV') === 'sandbox'
    ? 'https://api.sandbox.push.apple.com'
    : 'https://api.push.apple.com';
  const topic = Deno.env.get('APNS_TOPIC') ?? 'com.aalifestyle.app';

  const res = await fetch(`${host}/3/device/${token}`, {
    method: 'POST',
    headers: {
      authorization: `bearer ${await getApnsJwt()}`,
      'apns-topic': topic,
      'apns-push-type': 'alert',
      'apns-priority': '10',
    },
    body: JSON.stringify({ aps: { alert: { title, body }, sound: 'default' } }),
  });

  if (res.ok) return 'ok';
  const detail = await res.text();
  // 410 = token no longer active; BadDeviceToken usually means an env
  // mismatch (sandbox token vs production host) or an uninstalled app.
  if (res.status === 410 || detail.includes('BadDeviceToken')) return 'dead';
  console.error(`[apns] ${res.status} ${detail}`);
  return 'error';
}

// ---------------------------------------------------------------- FCM

let fcmToken: { token: string; expiresAt: number } | null = null;

async function getFcmAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  if (fcmToken && Date.now() < fcmToken.expiresAt - 60_000) return fcmToken.token;

  const key = await crypto.subtle.importKey(
    'pkcs8', pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`),
  );
  const assertion = `${header}.${claims}.${b64url(new Uint8Array(sig))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${assertion}`,
  });
  const json = await res.json();
  fcmToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return fcmToken.token;
}

async function sendFcm(token: string, title: string, body: string): Promise<'ok' | 'dead' | 'error' | 'skipped'> {
  const saRaw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!saRaw) return 'skipped';
  const sa = JSON.parse(saRaw);

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${await getFcmAccessToken(sa)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message: { token, notification: { title, body } } }),
    },
  );

  if (res.ok) return 'ok';
  const detail = await res.text();
  if (res.status === 404 || detail.includes('UNREGISTERED')) return 'dead';
  console.error(`[fcm] ${res.status} ${detail}`);
  return 'error';
}

// ---------------------------------------------------------------- dispatch

type DeviceToken = { token: string; platform: 'ios' | 'android' };

async function deliver(userId: string, tokens: DeviceToken[], kind: string, refId: string, sentOn: string, title: string, body: string) {
  // The INSERT is the dedup lock: if another run already claimed this
  // (user, kind, ref, day), we get a conflict and send nothing.
  const { data: claimed } = await supabase
    .from('push_log')
    .upsert(
      { user_id: userId, kind, ref_id: refId, sent_on: sentOn },
      { onConflict: 'user_id,kind,ref_id,sent_on', ignoreDuplicates: true },
    )
    .select();
  if (!claimed || claimed.length === 0) return 0;

  let sent = 0;
  for (const t of tokens) {
    const result = t.platform === 'ios'
      ? await sendApns(t.token, title, body)
      : await sendFcm(t.token, title, body);
    if (result === 'ok') sent++;
    if (result === 'dead') {
      await supabase.from('device_tokens').delete().eq('token', t.token);
    }
  }
  return sent;
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ampm}`;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('PUSH_CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return new Response('unauthorized', { status: 401 });
  }

  const { data: tokenRows, error } = await supabase
    .from('device_tokens')
    .select('user_id, token, platform');
  if (error) return new Response(error.message, { status: 500 });

  const byUser = new Map<string, DeviceToken[]>();
  for (const r of tokenRows ?? []) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
    byUser.get(r.user_id)!.push({ token: r.token, platform: r.platform });
  }
  if (byUser.size === 0) return Response.json({ users: 0, sent: 0 });

  const { data: profiles } = await supabase
    .from('users')
    .select('user_id, timezone')
    .in('user_id', [...byUser.keys()]);
  const tzByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.timezone]));

  let totalSent = 0;

  for (const [userId, tokens] of byUser) {
    const now = localNow(tzByUser.get(userId) ?? null);

    // --- event reminders: starts within the next 30 minutes ---------------
    // v1 covers non-recurring events; recurring ones fire only on their
    // stored date. Expanding recurrence server-side mirrors
    // src/utils/recurrence.js and is a deliberate follow-up.
    const { data: events } = await supabase
      .from('events')
      .select('id, title, start_time')
      .eq('user_id', userId)
      .eq('date', now.date);
    for (const ev of events ?? []) {
      const [h, m] = ev.start_time.split(':').map(Number);
      const startMin = h * 60 + m;
      const delta = startMin - now.minutesOfDay;
      if (delta >= 0 && delta < 30) {
        totalSent += await deliver(
          userId, tokens, 'event_reminder', ev.id, now.date,
          'Upcoming event', `${ev.title} at ${fmtTime(ev.start_time)}`,
        );
      }
    }

    // --- 9am local: birthdays + task digest -------------------------------
    if (now.hour === 9) {
      const { data: bdays } = await supabase
        .from('birthdays')
        .select('id, name, birth_date')
        .eq('user_id', userId);
      for (const b of bdays ?? []) {
        if (b.birth_date?.slice(5) === now.date.slice(5)) {
          totalSent += await deliver(
            userId, tokens, 'birthday', b.id, now.date,
            'Birthday today 🎂', `Today is ${b.name}'s birthday`,
          );
        }
      }

      const { count } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', false)
        .eq('due_date', now.date);
      if (count && count > 0) {
        totalSent += await deliver(
          userId, tokens, 'task_digest', '', now.date,
          'Today\'s tasks',
          count === 1 ? 'You have 1 task due today' : `You have ${count} tasks due today`,
        );
      }
    }

    // --- 5pm local: student work due tomorrow -----------------------------
    if (now.hour === 17) {
      const [{ count: assignments }, { count: exams }] = await Promise.all([
        supabase.from('student_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId).eq('completed', false).eq('due_date', now.tomorrow),
        supabase.from('student_exams')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId).eq('exam_date', now.tomorrow),
      ]);
      const parts: string[] = [];
      if (assignments) parts.push(`${assignments} assignment${assignments > 1 ? 's' : ''}`);
      if (exams) parts.push(`${exams} exam${exams > 1 ? 's' : ''}`);
      if (parts.length > 0) {
        totalSent += await deliver(
          userId, tokens, 'student_digest', '', now.date,
          'Due tomorrow', `You have ${parts.join(' and ')} due tomorrow`,
        );
      }
    }
  }

  return Response.json({ users: byUser.size, sent: totalSent });
});
