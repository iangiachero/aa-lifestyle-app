/*
  # Create Users Table and Profile Picture Storage

  ## Summary
  Sets up the core user data infrastructure for the application.

  ## New Tables

  ### `users`
  Stores extended user profile data collected during registration and onboarding.
  - `id` (uuid, primary key) - unique row identifier
  - `user_id` (uuid, unique, FK → auth.users) - links to Supabase auth user
  - `email` (text) - user's email address, synced from auth
  - `full_name` (text) - display name
  - `gender` (text) - 'female' | 'male' | null
  - `is_student` (boolean) - whether the user identified as a student
  - `focus` (text) - chosen focus from onboarding: organize | routine | lifestyle | academic | business
  - `schedule_type` (text) - early_bird | standard | night_owl
  - `timezone` (text) - user's selected timezone
  - `pfp_url` (text) - public URL of profile picture in storage
  - `onboarding_complete` (boolean) - whether the user has finished onboarding
  - `created_at` (timestamptz) - row creation timestamp
  - `updated_at` (timestamptz) - last update timestamp

  ## Security
  - RLS enabled on `users` table
  - SELECT policy: authenticated users can only read their own row
  - INSERT policy: authenticated users can only insert their own row
  - UPDATE policy: authenticated users can only update their own row

  ## Storage
  - Creates a public storage bucket `public_user_pfp` for profile pictures
  - Storage policies allow authenticated users to upload/update/delete only their own files
  - Public read access for all profile pictures (they are public URLs)

  ## Notes
  1. The `user_id` column references `auth.users(id)` with CASCADE delete
  2. An `updated_at` trigger automatically updates the timestamp on row update
  3. The storage bucket is public so profile picture URLs work without auth tokens
*/

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  gender text DEFAULT NULL,
  is_student boolean DEFAULT false,
  focus text DEFAULT NULL,
  schedule_type text DEFAULT 'standard',
  timezone text DEFAULT 'UTC',
  pfp_url text DEFAULT NULL,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS users_user_id_idx ON users(user_id);

-- Create the public profile picture storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_user_pfp', 'public_user_pfp', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload own pfp"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'public_user_pfp'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update own pfp"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'public_user_pfp'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own pfp"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'public_user_pfp'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage: allow public read access to all profile pictures
CREATE POLICY "Public can view all pfp"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public_user_pfp');
