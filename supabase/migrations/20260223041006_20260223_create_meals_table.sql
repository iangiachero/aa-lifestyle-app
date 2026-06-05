/*
  # Create meals table

  ## Summary
  A clean meals table aligned with the Meal Planning page's UI fields.
  Replaces reliance on the older meal_plans table for the main planning UI.

  ## New Tables

  ### meals
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, FK to auth.users) - Owner
  - `name` (text) - Meal / recipe name
  - `category` (text) - breakfast | lunch | dinner | snack
  - `time` (text) - Optional time string (HH:MM)
  - `day` (text) - Day of week: monday … sunday
  - `notes` (text) - Free-text notes
  - `ingredients` (jsonb) - Array of ingredient strings
  - `created_at` (timestamptz) - Row creation timestamp
  - `updated_at` (timestamptz) - Row last-update timestamp

  ## Security
  - RLS enabled
  - Four separate policies: SELECT, INSERT, UPDATE, DELETE — authenticated users only, own rows only

  ## Indexes
  - Index on (user_id, day) for fast per-user per-day queries
*/

CREATE TABLE IF NOT EXISTS meals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT 'breakfast',
  time        text NOT NULL DEFAULT '',
  day         text NOT NULL DEFAULT 'monday',
  notes       text NOT NULL DEFAULT '',
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meals_user_day_idx ON meals(user_id, day);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
