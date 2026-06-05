/*
  # Create Events Table for Calendar

  1. New Tables
    - `events`
      - `id` (uuid, primary key) - Unique identifier for each event
      - `user_id` (uuid, foreign key) - References auth.users, ensures user isolation
      - `title` (text, required) - Event name/title
      - `date` (date, required) - Date of the event
      - `start_time` (time, required) - Event start time
      - `end_time` (time, required) - Event end time
      - `category` (text) - Event category (personal, work, health, school, social)
      - `color` (text) - Color hex code for visual distinction
      - `notes` (text) - Additional event details/description
      - `repeat` (text) - Recurrence pattern (none, daily, weekly, monthly)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `events` table
    - Add policy for users to read their own events
    - Add policy for users to insert their own events
    - Add policy for users to update their own events
    - Add policy for users to delete their own events

  3. Important Notes
    - All events are user-specific for privacy
    - Timestamps auto-update for tracking changes
    - Default values ensure data consistency
    - Categories support custom values beyond defaults
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_user_date_idx ON events(user_id, date);