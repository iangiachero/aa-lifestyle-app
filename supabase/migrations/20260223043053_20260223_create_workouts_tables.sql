/*
  # Create Workout Management System Tables

  1. New Tables
    - `workouts` - Main workout records (user_id, name, duration, difficulty, muscle_groups[], is_favorite)
    - `workout_exercises` - Exercises per workout (name, sets, reps, rest_seconds, notes, order_index)
    - `workout_logs` - Historical completion records

  2. Security
    - RLS enabled on all three tables
    - Separate SELECT, INSERT, UPDATE, DELETE policies per table
    - workout_exercises policies use EXISTS check against parent workout ownership

  3. Indexes
    - user_id, is_favorite, updated_at on workouts
    - workout_id, order_index on workout_exercises
    - user_id, completed_at on workout_logs
*/

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

CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  workout_name text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  notes text,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout exercises"
  ON workout_exercises FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises FOR UPDATE TO authenticated
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
  ON workout_exercises FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_user_favorite_idx ON workouts(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS workouts_updated_at_idx ON workouts(updated_at DESC);

CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS workout_exercises_order_idx ON workout_exercises(workout_id, order_index);

CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS workout_logs_completed_at_idx ON workout_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS workout_logs_user_completed_idx ON workout_logs(user_id, completed_at DESC);
