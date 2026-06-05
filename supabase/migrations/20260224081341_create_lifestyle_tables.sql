/*
  # Create Lifestyle Tables

  ## Summary
  Introduces three tables to support the Lifestyle feature with full CRUD:

  1. New Tables
    - `lifestyle_modules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `name` (text) — module display name (e.g. "Skin", "Hair")
      - `image_url` (text, nullable) — Cloudinary or user-uploaded image
      - `gradient_index` (int) — fallback gradient when no image
      - `sort_order` (int) — display order in the grid
      - `is_default` (boolean) — true for seeded defaults
      - `created_at` (timestamptz)

    - `lifestyle_routines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `module_id` (uuid, FK to lifestyle_modules ON DELETE CASCADE)
      - `name` (text)
      - `cycle` (text) — Daily / Weekly / Monthly / Yearly / Custom text
      - `duration_minutes` (int, nullable)
      - `sort_order` (int)
      - `created_at` (timestamptz)

    - `lifestyle_steps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `routine_id` (uuid, FK to lifestyle_routines ON DELETE CASCADE)
      - `title` (text)
      - `sort_order` (int)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all three tables
    - Authenticated users can only SELECT / INSERT / UPDATE / DELETE their own rows
    - Policies check `auth.uid() = user_id`

  3. Indexes
    - `lifestyle_modules(user_id, sort_order)` for fast per-user grid loads
    - `lifestyle_routines(module_id, sort_order)` for fast per-module loads
    - `lifestyle_steps(routine_id, sort_order)` for fast per-routine loads
*/

-- ── lifestyle_modules ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lifestyle_modules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL DEFAULT '',
  image_url      text,
  gradient_index int  NOT NULL DEFAULT 0,
  sort_order     int  NOT NULL DEFAULT 0,
  is_default     boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE lifestyle_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own modules"
  ON lifestyle_modules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own modules"
  ON lifestyle_modules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own modules"
  ON lifestyle_modules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own modules"
  ON lifestyle_modules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lifestyle_modules_user_sort
  ON lifestyle_modules(user_id, sort_order);

-- ── lifestyle_routines ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lifestyle_routines (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id        uuid NOT NULL REFERENCES lifestyle_modules(id) ON DELETE CASCADE,
  name             text NOT NULL DEFAULT '',
  cycle            text NOT NULL DEFAULT '',
  duration_minutes int,
  sort_order       int  NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE lifestyle_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON lifestyle_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON lifestyle_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON lifestyle_routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON lifestyle_routines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lifestyle_routines_module_sort
  ON lifestyle_routines(module_id, sort_order);

-- ── lifestyle_steps ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lifestyle_steps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id uuid NOT NULL REFERENCES lifestyle_routines(id) ON DELETE CASCADE,
  title      text NOT NULL DEFAULT '',
  sort_order int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lifestyle_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own steps"
  ON lifestyle_steps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps"
  ON lifestyle_steps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps"
  ON lifestyle_steps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps"
  ON lifestyle_steps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lifestyle_steps_routine_sort
  ON lifestyle_steps(routine_id, sort_order);
