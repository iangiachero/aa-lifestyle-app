/*
  # Create Password Vault Table

  ## Summary
  Creates a secure password vault for storing encrypted credentials per user.

  ## New Tables
  - `password_vault`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users, cascade delete)
    - `site_name` (text) - Name of the website or service
    - `username` (text) - Username or email for the account
    - `encrypted_password` (text) - AES-GCM encrypted password stored as Base64 JSON
    - `url` (text) - Optional URL of the site
    - `category` (text) - Category: work, social, banking, shopping, other
    - `notes` (text) - Optional notes
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled: users can only access their own vault entries
  - Separate SELECT, INSERT, UPDATE, DELETE policies
  - Password is encrypted client-side before storage; server never sees plain text
*/

CREATE TABLE IF NOT EXISTS password_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  encrypted_password text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE password_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vault entries"
  ON password_vault
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vault entries"
  ON password_vault
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vault entries"
  ON password_vault
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vault entries"
  ON password_vault
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS password_vault_user_id_idx ON password_vault(user_id);
