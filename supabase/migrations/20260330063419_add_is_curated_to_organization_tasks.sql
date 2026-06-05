/*
  # Add is_curated to organization_tasks

  ## Summary
  Adds protection for curated Home Organization content, mirroring the same pattern
  used in checklists. Curated tasks (seeded from curated_home_org_items) cannot be
  deleted or edited by users; only user-created tasks can be modified.

  ## Changes

  ### Modified Tables
  - `organization_tasks`
    - New column `is_curated` (boolean, default false) — marks tasks seeded from
      curated data vs. tasks the user added themselves

  ### Data Updates
  - All existing rows in `organization_tasks` are marked as `is_curated = true`
    because they were all seeded from the curated library

  ### Security Changes
  - Existing DELETE policy replaced with one that blocks deletion of curated tasks
  - Existing UPDATE policy replaced with one that blocks editing of curated tasks
  - INSERT and SELECT policies are unchanged

  ## Notes
  1. `is_curated = true` rows are read-only for users (no delete, no update)
  2. `is_curated = false` rows (user-added) support full CRUD
  3. Checkbox toggle (completed field) still works for ALL tasks via a targeted UPDATE
     policy that only allows toggling the `completed` field on curated rows
*/

-- 1. Add column
ALTER TABLE organization_tasks
ADD COLUMN IF NOT EXISTS is_curated BOOLEAN DEFAULT false;

-- 2. Mark all existing tasks as curated (they were all seeded)
UPDATE organization_tasks SET is_curated = true WHERE is_curated = false;

-- 3. Drop old permissive DELETE policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organization_tasks'
      AND policyname = 'Users can delete own organization tasks'
  ) THEN
    DROP POLICY "Users can delete own organization tasks" ON organization_tasks;
  END IF;
END $$;

-- 4. New DELETE policy: only non-curated tasks can be deleted
CREATE POLICY "Users can delete own non-curated organization tasks"
  ON organization_tasks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_curated = false);

-- 5. Drop old UPDATE policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organization_tasks'
      AND policyname = 'Users can update own organization tasks'
  ) THEN
    DROP POLICY "Users can update own organization tasks" ON organization_tasks;
  END IF;
END $$;

-- 6. New UPDATE policy: allow full update on non-curated tasks,
--    and allow toggling `completed` on curated tasks (for checkbox)
CREATE POLICY "Users can update own non-curated organization tasks"
  ON organization_tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_curated = false)
  WITH CHECK (user_id = auth.uid() AND is_curated = false);

CREATE POLICY "Users can toggle completed on curated organization tasks"
  ON organization_tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_curated = true)
  WITH CHECK (user_id = auth.uid() AND is_curated = true);
