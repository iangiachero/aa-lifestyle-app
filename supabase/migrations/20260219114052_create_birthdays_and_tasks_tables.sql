/*
  # Create birthdays and tasks tables

  ## New Tables

  ### birthdays
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text) - person's name
  - `birth_date` (date) - the birthday (year can be any year, we match month+day)
  - `notes` (text, nullable) - optional notes
  - `created_at` (timestamptz)

  ### tasks
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `title` (text) - task name
  - `description` (text, nullable)
  - `category` (text) - personal, work, school, health, home
  - `priority` (text) - low, medium, high
  - `due_date` (date, nullable) - for calendar display
  - `color` (text) - hex color
  - `status` (text) - pending, completed
  - `repeat` (text) - none, daily, weekly, monthly
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Users can only access their own records

  ## Notes
  1. birthdays uses month+day matching so the year doesn't matter for yearly recurrence
  2. tasks table mirrors the mock client data so the calendar can read tasks from Supabase
*/

CREATE TABLE IF NOT EXISTS birthdays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own birthdays"
  ON birthdays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birthdays"
  ON birthdays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birthdays"
  ON birthdays FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own birthdays"
  ON birthdays FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'personal',
  priority text DEFAULT 'medium',
  due_date date,
  color text DEFAULT '#C9A962',
  status text DEFAULT 'pending',
  repeat text DEFAULT 'none',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
