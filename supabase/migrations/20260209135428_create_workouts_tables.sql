/*
  # Create Workout Management System Tables

  ## Overview
  Complete workout builder system allowing users to create, manage, and track custom workouts
  with detailed exercise information and workout completion history.

  ## 1. New Tables

  ### workouts table
  Main workout records containing workout metadata and configuration
    - `id` (uuid, primary key) - Unique workout identifier
    - `user_id` (uuid, foreign key) - References auth.users for user isolation
    - `name` (text, required) - Workout name (e.g., "Pull Day", "Upper Body Strength")
    - `duration` (integer, required) - Expected workout duration in minutes
    - `difficulty` (text, required) - Workout difficulty level (Beginner/Intermediate/Advanced)
    - `muscle_groups` (text array) - Target muscle groups (Back, Chest, Shoulders, Legs, Core, Full Body)
    - `is_favorite` (boolean) - Quick access flag for favorite workouts
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last modification timestamp

  ### workout_exercises table
  Individual exercises within each workout with sets, reps, and rest periods
    - `id` (uuid, primary key) - Unique exercise record identifier
    - `workout_id` (uuid, foreign key) - References parent workout
    - `name` (text, required) - Exercise name (e.g., "Pull-Ups", "Barbell Rows")
    - `sets` (integer, required) - Number of sets to perform
    - `reps` (text, required) - Reps per set (allows "8-12" ranges or "60s" for time)
    - `rest_seconds` (integer) - Rest period between sets in seconds
    - `notes` (text, optional) - Additional exercise instructions or tips
    - `order_index` (integer) - Exercise ordering within workout
    - `created_at` (timestamptz) - Record creation timestamp

  ### workout_logs table
  Historical record of completed workouts for tracking and statistics
    - `id` (uuid, primary key) - Unique log entry identifier
    - `user_id` (uuid, foreign key) - References auth.users
    - `workout_id` (uuid, foreign key, nullable) - References original workout (nullable if deleted)
    - `workout_name` (text, required) - Snapshot of workout name at completion time
    - `duration_minutes` (integer) - Actual workout duration
    - `notes` (text, optional) - Post-workout notes or feedback
    - `completed_at` (timestamptz) - Workout completion timestamp

  ## 2. Security Implementation

  All tables use Row Level Security (RLS) to ensure complete data isolation:
    - Users can only view their own workouts, exercises, and logs
    - Users can only create workouts associated with their user_id
    - Users can only update and delete their own records
    - Separate policies for SELECT, INSERT, UPDATE, DELETE operations

  ## 3. Performance Optimization

  Strategic indexes for common query patterns:
    - User-based lookups (user_id indexes)
    - Workout exercise relationships (workout_id indexes)
    - Date-based history queries (completed_at index)
    - Favorite filtering (is_favorite index)

  ## 4. Important Design Decisions

    - Muscle groups stored as text array for flexible multi-group workouts
    - Reps as text type to support ranges ("8-12") and time-based ("60s")
    - Workout logs keep workout_name snapshot to preserve history even if original deleted
    - Cascade deletion: deleting workout removes all associated exercises
    - No cascade on workout_logs to preserve history
    - Default values ensure data consistency (is_favorite = false, rest_seconds = 60)
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  muscle_groups text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sets integer NOT NULL CHECK (sets > 0),
  reps text NOT NULL,
  rest_seconds integer DEFAULT 60 CHECK (rest_seconds >= 0),
  notes text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  workout_name text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  notes text,
  completed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts table
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for workout_exercises table
CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own workout exercises"
  ON workout_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- RLS Policies for workout_logs table
CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_user_favorite_idx ON workouts(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS workouts_updated_at_idx ON workouts(updated_at DESC);

CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS workout_exercises_order_idx ON workout_exercises(workout_id, order_index);

CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS workout_logs_completed_at_idx ON workout_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS workout_logs_user_completed_idx ON workout_logs(user_id, completed_at DESC);
