
/*
  # Update Supplements Image for All Existing Users

  ## Summary
  Updates the image URL for the "Supplements" lifestyle module across all users.

  ## Changes
  1. `curated_lifestyle_modules` - Updates the Supplements image URL for the male curated module
  2. `lifestyle_modules` - Updates the Supplements image URL for ALL existing users

  ## Reason
  Previously, users who created their account before the image fix still have the old/broken
  image URL copied into their personal lifestyle_modules table. This migration fixes all of them.
*/

UPDATE curated_lifestyle_modules 
SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739824/erhjv1cy9q0hurvjcg76.png'
WHERE name = 'Supplements' AND gender = 'male';

UPDATE lifestyle_modules 
SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739824/erhjv1cy9q0hurvjcg76.png'
WHERE name = 'Supplements';
