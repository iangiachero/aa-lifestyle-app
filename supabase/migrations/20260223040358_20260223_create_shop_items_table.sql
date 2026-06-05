/*
  # Create shop_items table

  ## Summary
  Stores user shopping list items with category grouping, priority, optional
  link and notes, and a checked state for marking items as purchased.

  ## New Tables

  ### shop_items
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, FK to auth.users) - Owner of the item
  - `name` (text) - Item name
  - `category` (text) - Category slug (home, beauty, clothing, tech, fitness, gifts, subscriptions, custom)
  - `link` (text) - Optional URL link to product
  - `priority` (text) - Priority level: low, medium, high
  - `notes` (text) - Optional notes (size, color, etc.)
  - `checked` (boolean) - Whether the item has been purchased/checked off
  - `created_at` (timestamptz) - Row creation timestamp
  - `updated_at` (timestamptz) - Row last-update timestamp

  ## Security
  - RLS enabled; users can only access their own rows
  - Four separate policies: SELECT, INSERT, UPDATE, DELETE

  ## Indexes
  - Index on user_id for fast per-user queries
*/

CREATE TABLE IF NOT EXISTS shop_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  category   text NOT NULL DEFAULT 'home',
  link       text NOT NULL DEFAULT '',
  priority   text NOT NULL DEFAULT 'medium',
  notes      text NOT NULL DEFAULT '',
  checked    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shop_items_user_id_idx ON shop_items(user_id);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shop items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shop items"
  ON shop_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shop items"
  ON shop_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shop items"
  ON shop_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
