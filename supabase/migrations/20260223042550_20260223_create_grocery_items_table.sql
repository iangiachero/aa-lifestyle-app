/*
  # Create Grocery Items Table

  1. New Tables
    - `grocery_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Item name
      - `category` (text) - Always 'groceries'
      - `subcategory` (text) - produce, protein, dairy, etc.
      - `notes` (text) - Optional quantity/brand notes
      - `is_completed` (boolean) - Checked off status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Policies for SELECT, INSERT, UPDATE, DELETE restricted to authenticated owners

  3. Indexes
    - Index on user_id
    - Index on subcategory
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
