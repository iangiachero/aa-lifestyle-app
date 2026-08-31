/*
  Push notification support: device token registry + send-dedup log.

  ⚠ Per HANDOFF.md: do NOT apply this with `supabase db push`. Run this SQL in
  the Supabase SQL editor against the live project, then keep this file as the
  record of what was run.

  ### device_tokens
  One row per (device token). A token is globally unique and moves to whichever
  user is currently signed in on that device — upserting on token, not on
  (user_id, token), is what prevents a logged-out user's phone from receiving
  the next user's reminders.

  ### push_log
  Written only by the send-push edge function (service role — no RLS policies
  on purpose, so clients can neither read nor forge it). The UNIQUE constraint
  is the dedup mechanism: the sender INSERTs before sending and skips on
  conflict, so a reminder fires at most once per user/kind/ref/day even if the
  cron overlaps or retries.
*/

CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own device tokens"
  ON device_tokens FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can register own device tokens"
  ON device_tokens FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can remove own device tokens"
  ON device_tokens FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS device_tokens_user_id_idx ON device_tokens (user_id);

CREATE TABLE IF NOT EXISTS push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  ref_id text NOT NULL DEFAULT '',
  sent_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref_id, sent_on)
);

ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;
-- No policies: service role only.
