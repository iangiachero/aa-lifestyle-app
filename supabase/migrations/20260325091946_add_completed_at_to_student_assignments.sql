/*
  # Add completed_at column to student_assignments

  ## Changes
  - `student_assignments`: adds `completed_at` TIMESTAMPTZ column (nullable)

  ## Notes
  - Tracks when an assignment was marked complete
  - Safe to re-run (IF NOT EXISTS guard)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_assignments' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE student_assignments ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;
