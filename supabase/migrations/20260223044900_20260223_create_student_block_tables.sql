/*
  # Create Student Academic Block Tables

  1. New Tables
    - `student_assignments` — title, class_id, due_date, due_time, priority, notes, semester, completed
    - `student_exams`       — title, class_id, exam_date, exam_time, notes, semester
    - `student_study_sessions` — class_id, session_date, start_time, duration_minutes, semester
    - `student_projects`   — title, class_id, due_date, notes, semester
    - `student_custom_blocks` — title, class_id, due_date, due_time, custom_label, notes, semester

  2. Security
    - RLS enabled on all tables
    - SELECT, INSERT, UPDATE, DELETE policies for authenticated users (own rows only)

  3. Notes
    - class_id is nullable (user may not have added classes yet)
    - semester text field matches student_classes.semester values
*/

-- Assignments
CREATE TABLE IF NOT EXISTS student_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  class_id uuid REFERENCES student_classes(id) ON DELETE SET NULL,
  due_date date,
  due_time text DEFAULT '',
  priority text DEFAULT 'Medium',
  notes text DEFAULT '',
  semester text DEFAULT 'Spring 2026',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments"
  ON student_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
  ON student_assignments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
  ON student_assignments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
  ON student_assignments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_assignments_user_semester_idx ON student_assignments(user_id, semester);
CREATE INDEX IF NOT EXISTS student_assignments_due_date_idx ON student_assignments(due_date);

-- Exams
CREATE TABLE IF NOT EXISTS student_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  class_id uuid REFERENCES student_classes(id) ON DELETE SET NULL,
  exam_date date,
  exam_time text DEFAULT '',
  notes text DEFAULT '',
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exams"
  ON student_exams FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams"
  ON student_exams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams"
  ON student_exams FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own exams"
  ON student_exams FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_exams_user_semester_idx ON student_exams(user_id, semester);

-- Study Sessions
CREATE TABLE IF NOT EXISTS student_study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES student_classes(id) ON DELETE SET NULL,
  session_date date,
  start_time text DEFAULT '',
  duration_minutes integer DEFAULT 60,
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions"
  ON student_study_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON student_study_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON student_study_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON student_study_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_study_sessions_user_semester_idx ON student_study_sessions(user_id, semester);

-- Projects
CREATE TABLE IF NOT EXISTS student_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  class_id uuid REFERENCES student_classes(id) ON DELETE SET NULL,
  due_date date,
  notes text DEFAULT '',
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON student_projects FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON student_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON student_projects FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON student_projects FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_projects_user_semester_idx ON student_projects(user_id, semester);

-- Custom Blocks
CREATE TABLE IF NOT EXISTS student_custom_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  class_id uuid REFERENCES student_classes(id) ON DELETE SET NULL,
  due_date date,
  due_time text DEFAULT '',
  custom_label text DEFAULT '',
  notes text DEFAULT '',
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_custom_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom blocks"
  ON student_custom_blocks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom blocks"
  ON student_custom_blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom blocks"
  ON student_custom_blocks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom blocks"
  ON student_custom_blocks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_custom_blocks_user_semester_idx ON student_custom_blocks(user_id, semester);
