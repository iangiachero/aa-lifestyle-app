/*
  # Create home_items table

  1. New Tables
    - `home_items`
      - `id` (uuid, primary key) - Unique identifier for each home item/task
      - `user_id` (uuid) - Reference to the user who owns this item
      - `name` (text) - Name/description of the task or item
      - `type` (text) - Type of task (e.g., cleaning, organizing, maintenance)
      - `category` (text) - Category/frequency (e.g., daily, weekly, monthly, seasonal, kitchen, pantry, etc.)
      - `room` (text, optional) - Room location if applicable
      - `frequency` (text, optional) - How often the task should be done
      - `notes` (text, optional) - Additional notes or instructions
      - `is_completed` (boolean) - Whether the task is completed
      - `last_completed` (date, optional) - When the task was last completed
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on `home_items` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data
*/

CREATE TABLE IF NOT EXISTS home_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'cleaning',
  category text NOT NULL,
  room text,
  frequency text,
  notes text,
  is_completed boolean DEFAULT false,
  last_completed date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own home items"
  ON home_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own home items"
  ON home_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own home items"
  ON home_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own home items"
  ON home_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS home_items_user_id_idx ON home_items(user_id);
CREATE INDEX IF NOT EXISTS home_items_category_idx ON home_items(category);