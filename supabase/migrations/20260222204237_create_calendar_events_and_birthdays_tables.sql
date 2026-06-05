/*
  # Create calendar_events and birthdays tables

  ## New Tables

  ### events
  Stores calendar events created by users.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key → auth.users, cascade delete)
  - `title` (text, required) — event title shown on calendar
  - `date` (date, required) — the calendar day the event falls on
  - `start_time` (time, required) — start time (HH:MM)
  - `end_time` (time, required) — end time (HH:MM)
  - `category` (text) — personal | work | health | school | social
  - `color` (text) — hex color string derived from category
  - `notes` (text) — optional additional details
  - `repeat` (text) — none | daily | weekly | monthly
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz) — auto-updated by trigger on every update

  ### birthdays
  Stores birthday reminders for users.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key → auth.users, cascade delete)
  - `name` (text, required)
  - `birth_date` (date, required)
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - All policies restrict access to the owning user via `auth.uid() = user_id`
  - Separate SELECT, INSERT, UPDATE, DELETE policies per table

  ## Indexes
  - events: user_id, date, (user_id, date) compound
  - birthdays: user_id, birth_date
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  category text DEFAULT 'personal',
  color text DEFAULT '#C9A962',
  notes text,
  repeat text DEFAULT 'none',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS set_events_updated_at ON events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_user_date_idx ON events(user_id, date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS birthdays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS birthdays_user_id_idx ON birthdays(user_id);
CREATE INDEX IF NOT EXISTS birthdays_birth_date_idx ON birthdays(birth_date);

ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own birthdays"
  ON birthdays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birthdays"
  ON birthdays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birthdays"
  ON birthdays FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own birthdays"
  ON birthdays FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
