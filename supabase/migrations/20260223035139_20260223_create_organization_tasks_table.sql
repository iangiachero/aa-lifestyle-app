/*
  # Create organization_tasks table

  ## Summary
  Replaces the previous home_items usage with a dedicated organization_tasks table
  that stores user-created home organization tasks with icons, sections, sub-tasks,
  and completion state.

  ## New Tables

  ### organization_tasks
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, FK to auth.users) - Owner of the task
  - `icon` (text) - Iconify icon ID string (e.g., "mdi:home-outline")
  - `title` (text) - Task title
  - `section` (text) - Section/category slug (daily, weekly, kitchen, etc.)
  - `sub_tasks` (jsonb) - JSON array of sub-task name strings
  - `completed` (boolean) - Whether task is marked complete
  - `last_completed` (date) - Date when task was last completed
  - `created_at` (timestamptz) - Row creation timestamp
  - `updated_at` (timestamptz) - Row last-update timestamp

  ## Security
  - RLS enabled; users can only access their own rows
  - Four separate policies: SELECT, INSERT, UPDATE, DELETE

  ## Indexes
  - Index on user_id for fast per-user queries
*/

CREATE TABLE IF NOT EXISTS organization_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon          text NOT NULL DEFAULT 'mdi:home-outline',
  title         text NOT NULL DEFAULT '',
  section       text NOT NULL DEFAULT 'daily',
  sub_tasks     jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed     boolean NOT NULL DEFAULT false,
  last_completed date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_tasks_user_id_idx ON organization_tasks(user_id);

ALTER TABLE organization_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization tasks"
  ON organization_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organization tasks"
  ON organization_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organization tasks"
  ON organization_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own organization tasks"
  ON organization_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
