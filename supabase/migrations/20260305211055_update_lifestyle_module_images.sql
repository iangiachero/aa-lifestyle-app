/*
  # Update Lifestyle Module Images

  ## Summary
  Replaces old image URLs for lifestyle modules with new Cloudinary images.

  ## Changes
  Updates `image_url` in both:
  1. `curated_lifestyle_modules` - the template table used for seeding new users
  2. `lifestyle_modules` - user-owned copies so existing users see the new images immediately

  ## Image Mapping
  - Body (male + female): same new image for both genders
  - Hair (male + female): same new image for both genders
  - Skin (male + female): same new image for both genders
  - Hygiene (male only): new gender-specific image
  - Grooming (male only): new gender-specific image
  - Stretching (female only): new gender-specific image
  - Makeup (female only): new gender-specific image
  - Nails (female only): new gender-specific image

  ## No new modules are created - only image_url fields are updated.
*/

-- Update curated_lifestyle_modules (template table)
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772741351/vbukgcc8omyee1bllyky.png' WHERE slug IN ('body-m', 'body-f');
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772741884/mx5mvevrnzjzvr1p8w04.png' WHERE slug IN ('hair-m', 'hair-f');
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772742123/t7fmkygngq8hntpmm2nl.png' WHERE slug IN ('skin-m', 'skin-f');
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739834/u7yexgfysq2130j7mhxq.png' WHERE slug = 'hygiene-m';
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739828/gunwjnovzudiy8a16bub.png' WHERE slug = 'grooming-m';
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739804/sul3vx80zyf4q4p4mquq.png' WHERE slug = 'stretching-f';
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739840/z5x2mkr5tterxlooytkm.png' WHERE slug = 'makeup-f';
UPDATE curated_lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772740936/mrzvr1n5gyytxdeijekm.png' WHERE slug = 'nails-f';

-- Update lifestyle_modules (user-owned copies)
-- Body: both old male and female URLs replaced with single new image
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772741351/vbukgcc8omyee1bllyky.png'
  WHERE name = 'Body' AND image_url IN (
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772414795/d4krzor0uknycy1sfzwd.png',
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772415733/ppmllcyeenh4ii3qttzy.png'
  );

-- Hair: both old male and female URLs replaced with single new image
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772741884/mx5mvevrnzjzvr1p8w04.png'
  WHERE name = 'Hair' AND image_url IN (
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772414846/ivg5qa0sdralc9eu0yft.png',
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772415728/muqqhpnijrdoqgk19aot.png'
  );

-- Skin: both old male and female URLs replaced with single new image
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772742123/t7fmkygngq8hntpmm2nl.png'
  WHERE name = 'Skin' AND image_url IN (
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772414884/vakurevpq2yj0hhgjzmo.png',
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772415722/mqngbloux45zefuo7vsd.png'
  );

-- Hygiene (male only)
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739834/u7yexgfysq2130j7mhxq.png'
  WHERE name = 'Hygiene' AND image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772437250/avdna0xlseoiyvfuwkra.png';

-- Grooming (male only)
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739828/gunwjnovzudiy8a16bub.png'
  WHERE name = 'Grooming' AND image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772414744/ud0zmlnsjtnxzklitm2o.png';

-- Stretching (female only)
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739804/sul3vx80zyf4q4p4mquq.png'
  WHERE name = 'Stretching' AND image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772731903/ob0tlusvgy8xnsfjfbjp.png';

-- Makeup (female only)
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772739840/z5x2mkr5tterxlooytkm.png'
  WHERE name = 'Makeup' AND image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415742/oepb0oo9olvx51i85aay.png';

-- Nails (female only)
UPDATE lifestyle_modules SET image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772740936/mrzvr1n5gyytxdeijekm.png'
  WHERE name = 'Nails' AND image_url = 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415735/niltpgutuftrjd3pkmsj.png';
