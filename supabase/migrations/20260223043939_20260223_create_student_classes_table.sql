/*
  # Create Student Classes Table

  1. New Tables
    - `student_classes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `class_name` (text, required) - e.g., "Psychology 101"
      - `category` (text) - e.g., "Math", "Science", "Elective"
      - `color` (text) - hex color for visual identification
      - `instructor_name` (text, optional)
      - `instructor_email` (text, optional)
      - `meeting_days` (text array) - e.g., ["M", "W", "F"]
      - `meeting_start_time` (text) - stored as HH:MM string
      - `meeting_end_time` (text) - stored as HH:MM string
      - `location` (text, optional) - building/room or Zoom link
      - `notes` (text, optional)
      - `semester` (text) - e.g., "Spring 2026"
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Separate SELECT, INSERT, UPDATE, DELETE policies
    - All policies restrict to authenticated users and own rows only

  3. Indexes
    - user_id for fast user lookups
    - user_id + semester for filtered semester queries
*/

CREATE TABLE IF NOT EXISTS student_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_name text NOT NULL,
  category text DEFAULT '',
  color text DEFAULT '#6B9BD1',
  instructor_name text DEFAULT '',
  instructor_email text DEFAULT '',
  meeting_days text[] DEFAULT '{}',
  meeting_start_time text DEFAULT '',
  meeting_end_time text DEFAULT '',
  location text DEFAULT '',
  notes text DEFAULT '',
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own classes"
  ON student_classes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own classes"
  ON student_classes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own classes"
  ON student_classes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own classes"
  ON student_classes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_classes_user_id_idx ON student_classes(user_id);
CREATE INDEX IF NOT EXISTS student_classes_user_semester_idx ON student_classes(user_id, semester);
