/*
  # Meal Planning Tables

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `category` (text) - breakfast, lunch, dinner, snack, dessert
      - `prep_time` (integer) - minutes
      - `cook_time` (integer) - minutes
      - `servings` (integer)
      - `ingredients` (text) - newline separated list
      - `instructions` (text)
      - `image_url` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `recipe_title` (text) - meal name
      - `meal_type` (text) - breakfast, lunch, dinner, snack
      - `day_of_week` (text) - monday, tuesday, etc.
      - `week_start_date` (date) - start of the week
      - `meal_time` (time)
      - `notes` (text)
      - `ingredients` (text) - newline separated list
      - `recipe_id` (uuid, references recipes, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'other',
  prep_time integer DEFAULT 0,
  cook_time integer DEFAULT 0,
  servings integer DEFAULT 1,
  ingredients text DEFAULT '',
  instructions text DEFAULT '',
  image_url text,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_title text NOT NULL,
  meal_type text NOT NULL,
  day_of_week text NOT NULL,
  week_start_date date NOT NULL,
  meal_time time,
  notes text DEFAULT '',
  ingredients text DEFAULT '',
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON meal_plans(week_start_date, day_of_week);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);