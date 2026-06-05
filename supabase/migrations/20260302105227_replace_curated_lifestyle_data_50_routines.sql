/*
  # Replace Curated Lifestyle Data — 50 Routines (25 Female + 25 Male)

  ## Overview
  Completely replaces the curated lifestyle module catalog with the official
  gender-specific categories and 50 pre-built routines (25 per gender).

  ## Official Categories

  ### Female (5 modules)
  - Skin, Hair, Body, Makeup, Nails

  ### Male (5 modules)
  - Skin, Hair, Body, Grooming, Hygiene

  ## Changes
  1. Wipe all per-user lifestyle data (steps → routines → modules)
  2. Delete all existing curated_lifestyle_steps, curated_lifestyle_routines, curated_lifestyle_modules
  3. Insert 10 curated modules (5 female + 5 male) with new Cloudinary image URLs
  4. Insert 50 curated routines and all their steps

  ## Notes
  - All image_url values point to the official Cloudinary CDN images provided
  - The seed_lifestyle_for_user function remains unchanged — it reads from curated tables
  - Existing users will be re-seeded on next Lifestyle page visit (empty modules triggers seed)
*/

-- ─── 1. Wipe per-user data (cascade order) ───────────────────────────────────

DELETE FROM lifestyle_steps;
DELETE FROM lifestyle_routines;
DELETE FROM lifestyle_modules;

-- ─── 2. Wipe curated data (cascade order) ────────────────────────────────────

DELETE FROM curated_lifestyle_steps;
DELETE FROM curated_lifestyle_routines;
DELETE FROM curated_lifestyle_modules;

-- ─── 3. Insert 10 curated modules ────────────────────────────────────────────

INSERT INTO curated_lifestyle_modules (name, slug, gender, image_url, gradient_index, sort_order) VALUES
  ('Skin',     'skin-f',     'female', 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415722/mqngbloux45zefuo7vsd.png', 0, 0),
  ('Hair',     'hair-f',     'female', 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415728/muqqhpnijrdoqgk19aot.png', 1, 1),
  ('Body',     'body-f',     'female', 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415733/ppmllcyeenh4ii3qttzy.png', 2, 2),
  ('Makeup',   'makeup-f',   'female', 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415742/oepb0oo9olvx51i85aay.png', 3, 3),
  ('Nails',    'nails-f',    'female', 'https://res.cloudinary.com/dykhmifto/image/upload/v1772415735/niltpgutuftrjd3pkmsj.png', 4, 4),
  ('Skin',     'skin-m',     'male',   'https://res.cloudinary.com/dykhmifto/image/upload/v1772414884/vakurevpq2yj0hhgjzmo.png', 0, 0),
  ('Hair',     'hair-m',     'male',   'https://res.cloudinary.com/dykhmifto/image/upload/v1772414846/ivg5qa0sdralc9eu0yft.png', 1, 1),
  ('Body',     'body-m',     'male',   'https://res.cloudinary.com/dykhmifto/image/upload/v1772414795/d4krzor0uknycy1sfzwd.png', 2, 2),
  ('Grooming', 'grooming-m', 'male',   'https://res.cloudinary.com/dykhmifto/image/upload/v1772414744/ud0zmlnsjtnxzklitm2o.png', 3, 3),
  ('Hygiene',  'hygiene-m',  'male',   'https://res.cloudinary.com/dykhmifto/image/upload/v1772437250/avdna0xlseoiyvfuwkra.png', 4, 4);

-- ─── 4. Insert curated routines + steps ──────────────────────────────────────
-- Using a DO block to reference inserted module IDs

DO $$
DECLARE
  -- Female module IDs
  v_skin_f     uuid;
  v_hair_f     uuid;
  v_body_f     uuid;
  v_makeup_f   uuid;
  v_nails_f    uuid;
  -- Male module IDs
  v_skin_m     uuid;
  v_hair_m     uuid;
  v_body_m     uuid;
  v_grooming_m uuid;
  v_hygiene_m  uuid;
  -- Routine IDs
  v_r uuid;
BEGIN
  SELECT id INTO v_skin_f     FROM curated_lifestyle_modules WHERE slug = 'skin-f';
  SELECT id INTO v_hair_f     FROM curated_lifestyle_modules WHERE slug = 'hair-f';
  SELECT id INTO v_body_f     FROM curated_lifestyle_modules WHERE slug = 'body-f';
  SELECT id INTO v_makeup_f   FROM curated_lifestyle_modules WHERE slug = 'makeup-f';
  SELECT id INTO v_nails_f    FROM curated_lifestyle_modules WHERE slug = 'nails-f';
  SELECT id INTO v_skin_m     FROM curated_lifestyle_modules WHERE slug = 'skin-m';
  SELECT id INTO v_hair_m     FROM curated_lifestyle_modules WHERE slug = 'hair-m';
  SELECT id INTO v_body_m     FROM curated_lifestyle_modules WHERE slug = 'body-m';
  SELECT id INTO v_grooming_m FROM curated_lifestyle_modules WHERE slug = 'grooming-m';
  SELECT id INTO v_hygiene_m  FROM curated_lifestyle_modules WHERE slug = 'hygiene-m';

  -- ── FEMALE / SKIN ──────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_f, 'Morning Glow Routine', 'daily', 10, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Cleanser', 0), (v_r, 'Toner', 1), (v_r, 'Vitamin C Serum', 2),
    (v_r, 'Moisturizer', 3), (v_r, 'SPF 50', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_f, 'Nighttime Reset Routine', 'daily', 15, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Double Cleanse', 0), (v_r, 'Exfoliant (2x/week)', 1), (v_r, 'Hydrating Serum', 2),
    (v_r, 'Night Cream', 3), (v_r, 'Eye Cream', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_f, 'Weekly Exfoliation Routine', 'weekly', 20, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Gentle Cleanse', 0), (v_r, 'Chemical Exfoliant', 1), (v_r, 'Hydrating Mask', 2),
    (v_r, 'Serum', 3), (v_r, 'Rich Moisturizer', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_f, 'Acne-Care Routine', 'daily', 10, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Salicylic Acid Cleanser', 0), (v_r, 'Niacinamide Serum', 1), (v_r, 'Spot Treatment', 2),
    (v_r, 'Oil-Free Moisturizer', 3), (v_r, 'SPF', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_f, 'Hydration & Barrier Repair', 'daily', 12, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Gentle Cleanser', 0), (v_r, 'Hyaluronic Acid', 1), (v_r, 'Ceramide Serum', 2),
    (v_r, 'Barrier Cream', 3), (v_r, 'Facial Oil', 4);

  -- ── FEMALE / HAIR ──────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_f, 'Wash Day Routine', 'weekly', 60, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Pre-Poo Treatment', 0), (v_r, 'Shampoo Twice', 1), (v_r, 'Deep Condition (20 min)', 2),
    (v_r, 'Leave-In Conditioner', 3), (v_r, 'Style & Air Dry', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_f, 'Deep Conditioning Routine', 'weekly', 45, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Dampen Hair', 0), (v_r, 'Apply Hair Mask', 1), (v_r, 'Heat Cap (30 min)', 2),
    (v_r, 'Rinse Cool Water', 3), (v_r, 'Leave-In Treatment', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_f, 'Scalp Care Routine', 'weekly', 30, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Scalp Scrub', 0), (v_r, 'Massage (5 min)', 1), (v_r, 'Clarifying Shampoo', 2),
    (v_r, 'Scalp Serum', 3), (v_r, 'Light Conditioner', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_f, 'Styling Day Routine', 'daily', 15, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Refresh Spray', 0), (v_r, 'Detangle Gently', 1), (v_r, 'Heat Protectant', 2),
    (v_r, 'Style as Desired', 3), (v_r, 'Finishing Serum', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_f, 'Hair Growth Routine', 'weekly', 40, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Scalp Oil Massage', 0), (v_r, 'Protein Treatment', 1), (v_r, 'Biotin Mask', 2),
    (v_r, 'Rinse & Condition', 3), (v_r, 'Growth Serum', 4);

  -- ── FEMALE / BODY ──────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_f, 'Daily Body Care Routine', 'daily', 10, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower with Body Wash', 0), (v_r, 'Exfoliate (2x/week)', 1), (v_r, 'Pat Dry', 2),
    (v_r, 'Body Lotion', 3), (v_r, 'Targeted Areas', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_f, 'Shave Day Routine', 'weekly', 20, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Exfoliate Skin', 0), (v_r, 'Apply Shave Gel', 1), (v_r, 'Shave with Grain', 2),
    (v_r, 'Rinse Cool Water', 3), (v_r, 'Soothing Balm', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_f, 'Body Exfoliation Routine', 'weekly', 25, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Dry Brush Body', 0), (v_r, 'Sugar Scrub in Shower', 1), (v_r, 'Rinse Thoroughly', 2),
    (v_r, 'Body Oil on Damp Skin', 3), (v_r, 'Rich Body Butter', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_f, 'Moisture & Glow Routine', 'daily', 8, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower', 0), (v_r, 'Pat Dry (slightly damp)', 1), (v_r, 'Body Oil', 2),
    (v_r, 'Shimmer Lotion', 3), (v_r, 'Perfume Pulse Points', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_f, 'Self-Tan Prep Routine', 'weekly', 35, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Exfoliate Entire Body', 0), (v_r, 'Shave if Needed', 1), (v_r, 'Moisturize Dry Areas', 2),
    (v_r, 'Apply Self-Tan Evenly', 3), (v_r, 'Wait to Dress', 4);

  -- ── FEMALE / MAKEUP ────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_makeup_f, 'Everyday Makeup Routine', 'daily', 15, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Primer', 0), (v_r, 'Light Foundation', 1), (v_r, 'Concealer', 2),
    (v_r, 'Blush', 3), (v_r, 'Brow Gel', 4), (v_r, 'Mascara', 5), (v_r, 'Lip Balm', 6);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_makeup_f, 'Soft Glam Routine', 'weekly', 30, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Primer', 0), (v_r, 'Foundation', 1), (v_r, 'Concealer', 2),
    (v_r, 'Contour & Highlight', 3), (v_r, 'Neutral Eyeshadow', 4),
    (v_r, 'Eyeliner', 5), (v_r, 'Lashes', 6), (v_r, 'Nude Lip', 7);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_makeup_f, 'Full Glam Routine', 'special', 45, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Primer', 0), (v_r, 'Full Coverage Foundation', 1), (v_r, 'Contour & Bake', 2),
    (v_r, 'Dramatic Eyeshadow', 3), (v_r, 'Winged Liner', 4),
    (v_r, 'False Lashes', 5), (v_r, 'Lipstick & Gloss', 6);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_makeup_f, 'No-Makeup Makeup Routine', 'daily', 10, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Tinted Moisturizer', 0), (v_r, 'Light Concealer', 1), (v_r, 'Cream Blush', 2),
    (v_r, 'Brow Pencil', 3), (v_r, 'Clear Mascara', 4), (v_r, 'Tinted Lip Balm', 5);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_makeup_f, 'Night-Out Routine', 'special', 40, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Long-Wear Primer', 0), (v_r, 'Matte Foundation', 1), (v_r, 'Heavy Highlight', 2),
    (v_r, 'Smokey Eye', 3), (v_r, 'Bold Liner', 4),
    (v_r, 'Lashes', 5), (v_r, 'Statement Lip', 6);

  -- ── FEMALE / NAILS ─────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_nails_f, 'Weekly Nail Care Routine', 'weekly', 30, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Remove Old Polish', 0), (v_r, 'File & Shape', 1), (v_r, 'Cuticle Oil & Push Back', 2),
    (v_r, 'Buff Surface', 3), (v_r, 'Base Coat', 4), (v_r, 'Polish (2 Coats)', 5), (v_r, 'Top Coat', 6);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_nails_f, 'At-Home Manicure Routine', 'weekly', 40, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Soak in Warm Water', 0), (v_r, 'Exfoliate Hands', 1), (v_r, 'Push Back Cuticles', 2),
    (v_r, 'File Nails', 3), (v_r, 'Base Coat', 4), (v_r, 'Color', 5),
    (v_r, 'Top Coat', 6), (v_r, 'Cuticle Oil', 7);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_nails_f, 'Cuticle Care Routine', 'weekly', 15, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Warm Cuticle Oil', 0), (v_r, 'Massage Each Nail', 1), (v_r, 'Soak (5 min)', 2),
    (v_r, 'Gently Push Back', 3), (v_r, 'Trim Dead Skin', 4), (v_r, 'More Oil', 5);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_nails_f, 'Gel Removal Routine', 'monthly', 25, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'File Top Layer', 0), (v_r, 'Soak in Acetone (15 min)', 1), (v_r, 'Gently Push Off Gel', 2),
    (v_r, 'Buff Nails', 3), (v_r, 'Hydrating Treatment', 4), (v_r, 'Cuticle Oil', 5);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_nails_f, 'Nail Strengthening Routine', 'daily', 10, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Remove All Polish', 0), (v_r, 'Soak in Warm Water', 1), (v_r, 'Apply Nail Hardener', 2),
    (v_r, 'Biotin Treatment', 3), (v_r, 'Cuticle Oil Daily', 4);

  -- ── MALE / SKIN ────────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_m, 'Morning Face Routine', 'daily', 5, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Cleanser', 0), (v_r, 'Toner', 1), (v_r, 'Moisturizer', 2), (v_r, 'SPF 30', 3);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_m, 'Night Routine', 'daily', 8, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Face Wash', 0), (v_r, 'Exfoliant (3x/week)', 1), (v_r, 'Serum', 2), (v_r, 'Night Cream', 3);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_m, 'Deep Clean Routine', 'weekly', 15, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Exfoliating Cleanser', 0), (v_r, 'Clay Mask', 1), (v_r, 'Rinse', 2),
    (v_r, 'Toner', 3), (v_r, 'Moisturizer', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_m, 'Anti-Aging Routine', 'daily', 8, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Cleanser', 0), (v_r, 'Vitamin C Serum', 1), (v_r, 'Eye Cream', 2),
    (v_r, 'Moisturizer with SPF', 3);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_skin_m, 'Sensitive Skin Care', 'daily', 6, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Gentle Cleanser', 0), (v_r, 'Soothing Toner', 1), (v_r, 'Hydrating Serum', 2),
    (v_r, 'Fragrance-Free Moisturizer', 3);

  -- ── MALE / HAIR ────────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_m, 'Daily Hair Care', 'daily', 5, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Wet Hair', 0), (v_r, 'Shampoo & Massage', 1), (v_r, 'Conditioner on Ends', 2),
    (v_r, 'Rinse Cool', 3), (v_r, 'Towel Dry & Style', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_m, 'Scalp Treatment', 'weekly', 12, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Scalp Scrub', 0), (v_r, 'Massage (3 min)', 1), (v_r, 'Clarifying Shampoo', 2),
    (v_r, 'Light Conditioner', 3), (v_r, 'Style Product', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_m, 'Hair Styling Routine', 'daily', 8, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Damp Hair', 0), (v_r, 'Apply Styling Cream', 1), (v_r, 'Blow Dry', 2),
    (v_r, 'Finish with Pomade', 3), (v_r, 'Set with Spray', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_m, 'Deep Conditioning', 'weekly', 20, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Wet Hair', 0), (v_r, 'Apply Hair Mask', 1), (v_r, 'Leave (10 min)', 2),
    (v_r, 'Rinse Cool', 3), (v_r, 'Style', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hair_m, 'Hair Growth Care', 'weekly', 15, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Scalp Massage Oil', 0), (v_r, 'Biotin Treatment', 1), (v_r, 'Gentle Shampoo', 2),
    (v_r, 'Conditioning', 3), (v_r, 'Air Dry', 4);

  -- ── MALE / BODY ────────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_m, 'Post-Workout Routine', 'daily', 10, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower', 0), (v_r, 'Body Wash', 1), (v_r, 'Exfoliate Chest/Back', 2),
    (v_r, 'Rinse Cold', 3), (v_r, 'Body Lotion', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_m, 'Body Maintenance', 'weekly', 15, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower', 0), (v_r, 'Exfoliating Scrub', 1), (v_r, 'Shave/Trim Body Hair', 2),
    (v_r, 'Moisturize', 3), (v_r, 'Deodorant', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_m, 'Deep Exfoliation', 'weekly', 12, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Body Scrub All Over', 0), (v_r, 'Focus Problem Areas', 1), (v_r, 'Rinse Thoroughly', 2),
    (v_r, 'Pat Dry', 3), (v_r, 'Body Oil', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_m, 'Quick Body Care', 'daily', 5, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower', 0), (v_r, 'Body Wash', 1), (v_r, 'Quick Rinse', 2),
    (v_r, 'Towel Dry', 3), (v_r, 'Deodorant', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_body_m, 'Full Body Treatment', 'weekly', 30, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Dry Brush', 0), (v_r, 'Exfoliating Scrub', 1), (v_r, 'Deep Clean', 2),
    (v_r, 'Moisturize', 3), (v_r, 'Body Oil', 4);

  -- ── MALE / GROOMING ────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_grooming_m, 'Classic Wet Shave', 'daily', 10, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Hot Towel Pre-Shave', 0), (v_r, 'Apply Shaving Cream', 1), (v_r, 'Shave with Grain', 2),
    (v_r, 'Cold Rinse', 3), (v_r, 'Aftershave Balm', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_grooming_m, 'Beard Maintenance', 'daily', 8, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Wash Beard', 0), (v_r, 'Apply Beard Oil', 1), (v_r, 'Brush & Shape', 2),
    (v_r, 'Trim Edges', 3), (v_r, 'Style with Balm', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_grooming_m, 'Deep Clean Shave', 'weekly', 15, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Exfoliate Face', 0), (v_r, 'Hot Towel', 1), (v_r, 'Shaving Oil Layer', 2),
    (v_r, 'Shave with Grain', 3), (v_r, 'Against Grain Pass', 4), (v_r, 'Aftershave', 5);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_grooming_m, 'Beard Conditioning', 'weekly', 12, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Deep Clean Wash', 0), (v_r, 'Conditioning Mask (5 min)', 1), (v_r, 'Rinse', 2),
    (v_r, 'Oil Treatment', 3), (v_r, 'Brush Through', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_grooming_m, 'Nail & Hand Care', 'weekly', 10, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Trim Nails Short', 0), (v_r, 'File Edges', 1), (v_r, 'Clean Under Nails', 2),
    (v_r, 'Push Back Cuticles', 3), (v_r, 'Hand Cream', 4);

  -- ── MALE / HYGIENE ─────────────────────────────────────────────────────────

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hygiene_m, 'Morning Hygiene Routine', 'daily', 10, 0) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Brush Teeth', 0), (v_r, 'Floss', 1), (v_r, 'Mouthwash', 2),
    (v_r, 'Face Wash', 3), (v_r, 'Deodorant', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hygiene_m, 'Evening Hygiene Routine', 'daily', 15, 1) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Shower', 0), (v_r, 'Brush Teeth', 1), (v_r, 'Floss', 2),
    (v_r, 'Basic Skincare', 3), (v_r, 'Body Lotion', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hygiene_m, 'Deep Clean Routine', 'weekly', 40, 2) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Full Body Scrub', 0), (v_r, 'Hair Wash', 1), (v_r, 'Teeth Cleaning', 2),
    (v_r, 'Nail Trim', 3), (v_r, 'Full Moisturize', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hygiene_m, 'Quick Refresh', 'daily', 3, 3) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Face Wipe', 0), (v_r, 'Deodorant', 1), (v_r, 'Hand Wash', 2), (v_r, 'Breath Spray', 3);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_hygiene_m, 'Pre-Event Grooming', 'special', 45, 4) RETURNING id INTO v_r;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_r, 'Full Shower', 0), (v_r, 'Shave/Trim', 1), (v_r, 'Hair Styling', 2),
    (v_r, 'Cologne Application', 3), (v_r, 'Final Check', 4);

END $$;
