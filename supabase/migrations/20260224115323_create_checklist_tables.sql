/*
  # Create Checklist Tables

  ## New Tables
  - `user_checklists` - Stores user-created checklists
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `name` (text) - checklist name
    - `items` (jsonb) - array of item strings
    - `created_at` (timestamptz)

  - `checklist_progress` - Tracks checked/unchecked state per item per user
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `item_key` (text) - composite key like "checklistId-idx" or "checklistId-custom-idx"
    - `checked` (boolean)
    - Unique constraint on (user_id, item_key)

  - `checklist_custom_items` - Stores user-added items within a checklist
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `checklist_id` (uuid, references user_checklists)
    - `text` (text)
    - `sort_order` (integer)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all three tables
  - Users can only read and write their own data
*/

CREATE TABLE IF NOT EXISTS user_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own checklists"
  ON user_checklists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists"
  ON user_checklists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
  ON user_checklists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists"
  ON user_checklists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  checked boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, item_key)
);

ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own checklist progress"
  ON checklist_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON checklist_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON checklist_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS checklist_custom_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_id uuid NOT NULL REFERENCES user_checklists(id) ON DELETE CASCADE,
  text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checklist_custom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own custom items"
  ON checklist_custom_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom items"
  ON checklist_custom_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom items"
  ON checklist_custom_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom items"
  ON checklist_custom_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
