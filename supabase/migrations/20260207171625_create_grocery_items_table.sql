/*
  # Create Grocery Items Table

  1. New Tables
    - `grocery_items`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Item name
      - `category` (text) - Main category (always 'groceries')
      - `subcategory` (text) - Specific category (produce, protein, dairy, etc.)
      - `notes` (text, optional) - Additional details like quantity or brand
      - `is_completed` (boolean) - Whether item is checked off
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `grocery_items` table
    - Add policy for users to read their own grocery items
    - Add policy for users to insert their own grocery items
    - Add policy for users to update their own grocery items
    - Add policy for users to delete their own grocery items

  3. Indexes
    - Add index on `user_id` for faster queries
    - Add index on `subcategory` for category filtering
*/

CREATE TABLE IF NOT EXISTS grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text DEFAULT 'groceries',
  subcategory text DEFAULT 'produce',
  notes text DEFAULT '',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grocery items"
  ON grocery_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery items"
  ON grocery_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery items"
  ON grocery_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery items"
  ON grocery_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS grocery_items_user_id_idx ON grocery_items(user_id);
CREATE INDEX IF NOT EXISTS grocery_items_subcategory_idx ON grocery_items(subcategory);

CREATE OR REPLACE FUNCTION update_grocery_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grocery_items_updated_at
  BEFORE UPDATE ON grocery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_grocery_items_updated_at();