/*
  # Create lifestyle-images Storage Bucket

  ## Overview
  Creates the public `lifestyle-images` bucket used for:
  1. Curated module images (seeded from Cloudinary references)
  2. Custom user-uploaded module images stored at custom/{userId}/{timestamp}.{ext}

  ## Changes
  - New public bucket: `lifestyle-images` (10MB limit, images only)
  - Storage policies for authenticated upload/update/delete in custom/ folder
  - Public read access for all objects in the bucket
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lifestyle-images',
  'lifestyle-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view lifestyle images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lifestyle-images');

CREATE POLICY "Authenticated users can upload custom lifestyle images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lifestyle-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can update own custom lifestyle images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lifestyle-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete own custom lifestyle images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lifestyle-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
