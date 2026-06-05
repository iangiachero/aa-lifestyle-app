/*
  # Create Checklist Tables

  1. New Tables
    - `checklist_topics` - Global checklist categories (Travel, Wedding, Moving, etc.)
      - `id` (uuid, primary key)
      - `title` (text) - Topic name
      - `icon_key` (text) - Lucide icon key for display
      - `sort_order` (integer) - Display order
      - `is_active` (boolean) - Whether the topic is visible

    - `checklist_items` - Default template items for each topic
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key) - References checklist_topics
      - `text` (text) - Item description
      - `sort_order` (integer) - Display order

    - `user_checklist_custom_items` - Custom items added by users
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - References auth.users
      - `topic_id` (uuid, foreign key) - References checklist_topics
      - `text` (text) - Item description
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

    - `user_checklist_progress` - Tracks checked state per user
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - References auth.users
      - `topic_id` (uuid, foreign key) - References checklist_topics
      - `item_id` (uuid, nullable) - References checklist_items (for template items)
      - `custom_item_id` (uuid, nullable) - References user_checklist_custom_items (for user items)
      - `is_checked` (boolean)
      - `checked_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - checklist_topics & checklist_items: readable by all authenticated users (global templates)
    - user_checklist_custom_items & user_checklist_progress: per-user access only

  3. Indexes
    - topic_id indexes on items and progress tables
    - user_id indexes on user tables
*/

-- Global topic templates
CREATE TABLE IF NOT EXISTS checklist_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon_key text DEFAULT 'sparkles',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

ALTER TABLE checklist_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active checklist topics"
  ON checklist_topics FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Global template items
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES checklist_topics(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  sort_order integer DEFAULT 0
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklist_topics
      WHERE checklist_topics.id = checklist_items.topic_id
      AND checklist_topics.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS checklist_items_topic_id_idx ON checklist_items(topic_id);

-- User custom items
CREATE TABLE IF NOT EXISTS user_checklist_custom_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES checklist_topics(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_checklist_custom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom checklist items"
  ON user_checklist_custom_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom checklist items"
  ON user_checklist_custom_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom checklist items"
  ON user_checklist_custom_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom checklist items"
  ON user_checklist_custom_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_checklist_custom_items_user_id_idx ON user_checklist_custom_items(user_id);
CREATE INDEX IF NOT EXISTS user_checklist_custom_items_topic_id_idx ON user_checklist_custom_items(topic_id);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES checklist_topics(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES checklist_items(id) ON DELETE CASCADE,
  custom_item_id uuid REFERENCES user_checklist_custom_items(id) ON DELETE CASCADE,
  is_checked boolean DEFAULT false,
  checked_at timestamptz
);

ALTER TABLE user_checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist progress"
  ON user_checklist_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON user_checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON user_checklist_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON user_checklist_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_checklist_progress_user_id_idx ON user_checklist_progress(user_id);
CREATE INDEX IF NOT EXISTS user_checklist_progress_topic_id_idx ON user_checklist_progress(topic_id);
CREATE INDEX IF NOT EXISTS user_checklist_progress_item_id_idx ON user_checklist_progress(item_id);
CREATE INDEX IF NOT EXISTS user_checklist_progress_custom_item_id_idx ON user_checklist_progress(custom_item_id);
