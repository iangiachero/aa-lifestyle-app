/*
  # Add end_date column to events table

  ## Summary
  Adds support for multi-day events by introducing an end_date column.

  ## Changes
  ### Modified Tables
  - `events`
    - New column: `end_date` (DATE, nullable) — the last day of the event.
      If NULL or equal to `date`, the event is a single-day event.

  ## Notes
  1. Existing events are backfilled: end_date = date for all current rows.
  2. No data is destroyed; this is a purely additive change.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE events ADD COLUMN end_date DATE;
  END IF;
END $$;

UPDATE events SET end_date = date WHERE end_date IS NULL;
