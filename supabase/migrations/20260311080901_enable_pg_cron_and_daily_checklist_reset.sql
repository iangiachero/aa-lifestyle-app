/*
  # Enable pg_cron and set up daily checklist progress reset

  ## Summary
  This migration:
  1. Adds `updated_at` timestamptz column to `checklist_progress` to track last toggle time
  2. Creates `reset_checklist_progress_daily()` function that sets checked = false for ALL progress rows
  3. Enables the pg_cron extension
  4. Schedules the reset job to run every day at 00:00 UTC

  ## Changes to Existing Tables
  - `checklist_progress.updated_at` (timestamptz, DEFAULT now()) - tracks when item was last changed

  ## New Functions
  - `reset_checklist_progress_daily()` - resets all checked items to false

  ## Scheduled Jobs
  - `daily-checklist-reset`: runs every day at midnight UTC, calls reset_checklist_progress_daily()

  ## Notes
  - The reset clears only the checked/unchecked state in checklist_progress
  - Custom items added by users (checklist_custom_items) are NOT affected
  - The checklists themselves (user_checklists) are NOT affected
  - All items will be unchecked each day at midnight UTC
*/

-- 1. Add updated_at to checklist_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'checklist_progress' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE checklist_progress ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 2. Update upsert trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_checklist_progress_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_checklist_progress_updated_at ON checklist_progress;
CREATE TRIGGER trg_checklist_progress_updated_at
  BEFORE UPDATE ON checklist_progress
  FOR EACH ROW EXECUTE FUNCTION update_checklist_progress_updated_at();

-- 3. Create the daily reset function
CREATE OR REPLACE FUNCTION reset_checklist_progress_daily()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE checklist_progress
  SET checked = false, updated_at = now()
  WHERE checked = true;
END;
$$;

-- 4. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 5. Schedule the daily reset at midnight UTC
SELECT cron.schedule(
  'daily-checklist-reset',
  '0 0 * * *',
  'SELECT reset_checklist_progress_daily()'
);
