/*
  # Create Profile Pictures Storage Bucket

  1. Storage
    - Create `profile-pictures` bucket for storing user avatars
    - Set bucket to public access
    - Add size limit of 5MB per file

  2. Security
    - Add policy for authenticated users to upload their own profile pictures
    - Add policy for authenticated users to update their own profile pictures
    - Add policy for authenticated users to delete their own profile pictures
    - Add policy for public read access to all profile pictures
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to all profile pictures
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');