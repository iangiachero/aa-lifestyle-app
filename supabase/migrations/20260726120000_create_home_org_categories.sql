/*
  # Create home_org_categories table (user-created Home Organization categories)

  ## Summary
  Until now a Home Organization "bar" existed only implicitly: it was any distinct
  `organization_tasks.section` slug, and the 21 curated sections were hardcoded in
  the frontend. There was no way for a user to create their own category — the
  Create sheet could only add a task into one of the curated sections, which is
  why user-made checklists ended up buried inside curated ones.

  This table gives user-created categories a real home, so they can be created,
  renamed, re-iconed, reordered and deleted independently of their tasks, and can
  exist while still empty.

  ## New Table
  - `home_org_categories`
    - `id` (uuid, PK) — also used as the `section` slug on organization_tasks
    - `user_id` (uuid, FK auth.users)
    - `name` (text) — display name of the bar
    - `icon` (text) — Iconify icon id (e.g. "mdi:home-outline")
    - `color_tag` (text) — hex colour
    - `sort_order` (integer) — ordering among the user's own categories
    - `created_at` / `updated_at` (timestamptz)

  ## Relationship to organization_tasks
  Tasks belong to a custom category when `organization_tasks.section` equals the
  category's `id` (as text). No FK is added because `section` also holds the
  curated slugs ('kitchen-organization', …) and legacy values; deleting a
  category therefore deletes its tasks explicitly in the app layer.

  ## Security
  - RLS enabled; users can only read and write their own categories.

  ## Note
  This table and its policies were applied to the production database on
  2026-07-30 via the Supabase SQL editor; this file documents that change so the
  repo and the live schema stay in step.
*/

CREATE TABLE IF NOT EXISTS home_org_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  icon       text NOT NULL DEFAULT 'mdi:home-outline',
  color_tag  text NOT NULL DEFAULT '#C9A962',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS home_org_categories_user_id_idx
  ON home_org_categories(user_id);

ALTER TABLE home_org_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own home org categories" ON home_org_categories;
CREATE POLICY "Users can select own home org categories"
  ON home_org_categories FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own home org categories" ON home_org_categories;
CREATE POLICY "Users can insert own home org categories"
  ON home_org_categories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own home org categories" ON home_org_categories;
CREATE POLICY "Users can update own home org categories"
  ON home_org_categories FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own home org categories" ON home_org_categories;
CREATE POLICY "Users can delete own home org categories"
  ON home_org_categories FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
