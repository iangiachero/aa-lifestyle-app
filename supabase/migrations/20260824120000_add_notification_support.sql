/*
  # Notification preferences and missing reminder-time fields

  ## Summary
  Data-model groundwork for Ava's notifications request (see
  NOTIFICATIONS_SPEC.md). The actual scheduling of local notifications depends
  on Capacitor, which doesn't exist yet — this only adds what the settings UI
  and future scheduling logic will read and write.

  ## New Table: notification_preferences
  One row per (user, category) rather than one wide row per user — the eight
  categories have different config shapes (an offset in minutes, a time of
  day, "days before" counts), and new categories can be added later without a
  schema migration.
  - `user_id` (uuid, FK auth.users, cascade)
  - `category` (text) — 'calendar' | 'tasks' | 'school' | 'meals' | 'lifestyle'
    | 'home_organization' | 'morning_overview' | 'evening_reminder'
  - `enabled` (boolean, default false) — opt-in, not opt-out
  - `config` (jsonb) — shape depends on category, e.g.
    `{"offset_minutes": 30}` for calendar, `{"days_before": [3, 0]}` for
    school, `{"time": "08:00"}` for the morning overview
  - unique (user_id, category)

  ## Column additions
  Neither `lifestyle_routines` nor `home_org_categories` had any concept of
  "when" before this — reminders for either were impossible to schedule
  regardless of the notification system, not just unbuilt.
  - `lifestyle_routines.reminder_time` (time, nullable)
  - `lifestyle_routines.reminder_days_of_week` (int[], nullable — 0=Sunday..6=Saturday)
  - `home_org_categories.reminder_time` (time, nullable)
  - `home_org_categories.reminder_days_of_week` (int[], nullable)

  home_org_categories, not organization_tasks, is the scheduling grain for
  "home organization reminders" — a user has ~21-30 categories, not the
  800+ individual checklist items underneath them; "remind me about Weekly
  Cleaning on Saturdays" is the natural unit, per-item reminders are not.

  ## Security
  RLS on notification_preferences: authenticated users can only read/write
  their own rows.
*/

CREATE TABLE IF NOT EXISTS notification_preferences (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category   text NOT NULL,
  enabled    boolean NOT NULL DEFAULT false,
  config     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx
  ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notification preferences" ON notification_preferences;
CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

ALTER TABLE lifestyle_routines
  ADD COLUMN IF NOT EXISTS reminder_time time,
  ADD COLUMN IF NOT EXISTS reminder_days_of_week integer[];

ALTER TABLE home_org_categories
  ADD COLUMN IF NOT EXISTS reminder_time time,
  ADD COLUMN IF NOT EXISTS reminder_days_of_week integer[];
