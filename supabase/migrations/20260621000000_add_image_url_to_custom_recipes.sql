-- Add image_url column to custom_recipes for user-uploaded recipe photos
ALTER TABLE custom_recipes ADD COLUMN IF NOT EXISTS image_url text;
