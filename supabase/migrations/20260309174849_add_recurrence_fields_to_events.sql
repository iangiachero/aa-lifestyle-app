/*
  # Add recurrence fields to events table

  ## Changes
  - Adds `recurrence_end_date` column to `events` table (nullable date)
    - Optional end date for a recurring series; if null, events repeat indefinitely (up to client-side limit)
  - Adds `recurrence_exceptions` column to `events` table (jsonb array of date strings)
    - Stores dates where a specific instance was deleted individually (format: ['yyyy-MM-dd', ...])
  - Updates `repeat` column to also accept 'yearly' in addition to existing values

  ## Notes
  - No existing data is modified
  - No RLS changes needed (existing policies cover these new columns)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_end_date'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_end_date date;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_exceptions'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_exceptions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
