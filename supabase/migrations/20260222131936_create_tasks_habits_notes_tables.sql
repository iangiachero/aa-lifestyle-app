/*
  # Create tasks, habits, events, notes, student_items, content_ideas tables

  ## New Tables

  ### tasks
  - `id` (uuid, pk)
  - `user_id` (uuid, FK → auth.users)
  - `title` (text)
  - `category` (text) — personal, work, school, home, health
  - `priority` (text) — urgent, high, medium, low
  - `due_date` (date, nullable)
  - `completed` (boolean, default false)
  - `created_at` (timestamptz)

  ### habits
  - `id` (uuid, pk)
  - `user_id` (uuid, FK → auth.users)
  - `name` (text)
  - `icon` (text, emoji or icon key)
  - `color` (text)
  - `streak` (integer, default 0)
  - `last_completed` (date, nullable)
  - `created_at` (timestamptz)

  ### notes
  - `id` (uuid, pk)
  - `user_id` (uuid, FK → auth.users)
  - `title` (text)
  - `content` (text)
  - `pinned` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### student_items
  - `id` (uuid, pk)
  - `user_id` (uuid, FK → auth.users)
  - `type` (text) — class, assignment, exam, study, project, custom
  - `title` (text)
  - `semester` (text)
  - `details` (jsonb, nullable) — instructor, days, time, etc.
  - `due_date` (date, nullable)
  - `completed` (boolean, default false)
  - `created_at` (timestamptz)

  ### content_ideas
  - `id` (uuid, pk)
  - `user_id` (uuid, FK → auth.users)
  - `title` (text)
  - `platform` (text)
  - `status` (text) — idea, in-progress, ready, published
  - `scheduled_date` (date, nullable)
  - `notes` (text, default '')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own rows
*/

-- ─── TASKS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'personal',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);

-- ─── HABITS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '✓',
  color text NOT NULL DEFAULT '#C9A962',
  streak integer NOT NULL DEFAULT 0,
  last_completed date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);

-- ─── NOTES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);

-- ─── STUDENT ITEMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'custom',
  title text NOT NULL DEFAULT '',
  semester text NOT NULL DEFAULT '',
  details jsonb,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own student_items"
  ON student_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own student_items"
  ON student_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own student_items"
  ON student_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own student_items"
  ON student_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS student_items_user_id_idx ON student_items(user_id);

-- ─── CONTENT IDEAS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'instagram',
  status text NOT NULL DEFAULT 'idea',
  scheduled_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content_ideas"
  ON content_ideas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content_ideas"
  ON content_ideas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_ideas"
  ON content_ideas FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content_ideas"
  ON content_ideas FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS content_ideas_user_id_idx ON content_ideas(user_id);
