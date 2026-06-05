/*
  # Add is_online flag to student_classes

  ## Summary
  Adds an `is_online` boolean column to the `student_classes` table to support
  asynchronous/online classes that have no fixed meeting schedule.

  ## Changes
  ### Modified Tables
  - `student_classes`
    - Added `is_online` (boolean, default false) — when true, the class has no fixed
      day/time schedule and will display an "Online" badge in the UI

  ## Notes
  - All existing rows will have `is_online = false` by default (no data loss)
  - No RLS changes required; existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_classes' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE student_classes ADD COLUMN is_online BOOLEAN DEFAULT false;
  END IF;
END $$;
