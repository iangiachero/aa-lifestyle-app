/*
  # Add completed flag to the remaining student blocks

  ## Summary
  Only `student_assignments` could be ticked off; exams, study sessions,
  projects and custom blocks had no completion state at all, so the checkbox
  simply did not exist for them. The client asked for every block type to behave
  the same way.

  ## New Columns
  - `student_exams.completed` (boolean, default false)
  - `student_study_sessions.completed` (boolean, default false)
  - `student_projects.completed` (boolean, default false)
  - `student_custom_blocks.completed` (boolean, default false)

  plus a matching `completed_at` (timestamptz, nullable) on each, mirroring what
  student_assignments already stores.

  ## Notes
  - Existing rows default to not completed, so nothing changes for current data.
  - The app tolerates these columns being absent: the toggle retries without
    them and simply doesn't persist, so the UI keeps working before this
    migration is applied.
*/

ALTER TABLE student_exams
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE student_study_sessions
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE student_projects
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE student_custom_blocks
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;
