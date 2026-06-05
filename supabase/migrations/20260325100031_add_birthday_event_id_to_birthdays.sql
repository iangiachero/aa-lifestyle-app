/*
  # Add birthday_event_id to birthdays table

  1. Changes
    - `birthdays` table: add `birthday_event_id` (uuid, nullable) — stores the id of the
      auto-generated yearly recurring calendar event so it can be cleaned up when the
      birthday is deleted.

  2. Notes
    - Column is nullable: existing birthday rows won't have a linked event until the
      user re-saves them (or a backfill migration is applied later).
    - No FK constraint to `events` to avoid cascade issues with the existing RLS setup.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'birthdays' AND column_name = 'birthday_event_id'
  ) THEN
    ALTER TABLE birthdays ADD COLUMN birthday_event_id uuid;
  END IF;
END $$;
