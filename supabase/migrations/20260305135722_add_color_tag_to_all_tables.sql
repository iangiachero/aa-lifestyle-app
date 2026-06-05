/*
  # Add Color Tag Columns to Tasks, Events, Checklists, Home Organization, and Shopping

  ## Summary
  Adds a `color_tag` (or `color`) column to five tables to support visual color coding.
  Also creates a new `shopping_items` table to move Shopping from local state to Supabase.

  ## Changes

  ### Modified Tables
  1. `tasks` — adds `color_tag TEXT DEFAULT '#6B7280'`
  2. `events` — `color` column already exists; updates default to `#6B7280` for new items
  3. `user_checklists` — adds `color_tag TEXT DEFAULT '#6B7280'`
  4. `checklist_custom_items` — adds `color_tag TEXT DEFAULT '#6B7280'`
  5. `organization_tasks` — adds `color_tag TEXT DEFAULT '#6B7280'`

  ### New Tables
  6. `shopping_items` — full table for persisting shopping/wish-list items per user

  ## Security
  - RLS enabled on `shopping_items`
  - Policies: authenticated users can only access their own rows

  ## Notes
  - All new color columns default to gray (#6B7280) so existing data is unaffected
  - Indexes added on color columns for query performance
*/

-- 1. Tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT '#6B7280';

-- 2. Events color column already exists; ensure default is consistent
ALTER TABLE events
  ALTER COLUMN color SET DEFAULT '#6B7280';

-- 3. user_checklists
ALTER TABLE user_checklists
  ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT '#6B7280';

-- 4. checklist_custom_items
ALTER TABLE checklist_custom_items
  ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT '#6B7280';

-- 5. organization_tasks
ALTER TABLE organization_tasks
  ADD COLUMN IF NOT EXISTS color_tag TEXT DEFAULT '#6B7280';

-- 6. shopping_items (new table)
CREATE TABLE IF NOT EXISTS shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'home',
  link TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  color_tag TEXT NOT NULL DEFAULT '#6B7280',
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own shopping items"
  ON shopping_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping items"
  ON shopping_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items"
  ON shopping_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items"
  ON shopping_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_color_tag ON tasks(color_tag);
CREATE INDEX IF NOT EXISTS idx_events_color ON events(color);
CREATE INDEX IF NOT EXISTS idx_organization_tasks_color_tag ON organization_tasks(color_tag);
CREATE INDEX IF NOT EXISTS idx_shopping_items_color_tag ON shopping_items(color_tag);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);
