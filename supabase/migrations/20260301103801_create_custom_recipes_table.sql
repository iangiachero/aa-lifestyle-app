/*
  # Create custom_recipes table

  ## Summary
  Adds a new table for user-created recipes in the Meal Planning feature.

  ## New Tables

  ### custom_recipes
  - `id` (uuid, primary key) — unique identifier
  - `user_id` (uuid, FK to auth.users) — owner of the recipe
  - `title` (text) — recipe name
  - `category` (text) — recipe category (e.g. Breakfast, Lunch, Dinner)
  - `time` (text) — prep/cook time as free text (e.g. "30 min")
  - `calories` (integer) — calorie count per serving
  - `servings` (integer) — number of servings
  - `difficulty` (text) — easy or medium
  - `ingredients` (jsonb) — array of ingredient strings
  - `created_at` (timestamptz) — creation timestamp

  ## Security
  - RLS enabled
  - Users can only select, insert, update, and delete their own rows
*/

CREATE TABLE IF NOT EXISTS custom_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Breakfast',
  time text NOT NULL DEFAULT '',
  calories integer NOT NULL DEFAULT 0,
  servings integer NOT NULL DEFAULT 1,
  difficulty text NOT NULL DEFAULT 'easy',
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own custom recipes"
  ON custom_recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom recipes"
  ON custom_recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom recipes"
  ON custom_recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom recipes"
  ON custom_recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
