/*
  # Add Stretching (Female) and Supplements (Male) lifestyle categories

  ## Summary
  Adds two new 6th lifestyle categories - one for each gender - each containing 5 curated routines with 5 steps each.

  ## New Curated Modules
  - Stretching (female, slug: stretching-f, sort_order: 5)
  - Supplements (male, slug: supplements-m, sort_order: 5)

  ## New Curated Routines: 5 per module = 10 total, 50 new steps total

  ## Backfill
  - All existing users in the users table will receive the new category matching their gender
*/

-- ─────────────────────────────────────────────
-- 1. NEW CURATED MODULES
-- ─────────────────────────────────────────────

INSERT INTO curated_lifestyle_modules (name, slug, gender, image_url, gradient_index, sort_order)
VALUES
  (
    'Stretching',
    'stretching-f',
    'female',
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772731903/ob0tlusvgy8xnsfjfbjp.png',
    5,
    5
  ),
  (
    'Supplements',
    'supplements-m',
    'male',
    'https://res.cloudinary.com/dykhmifto/image/upload/v1772731789/crtnkyaetxqzta2v4c8v.png',
    5,
    5
  )
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. ROUTINES + STEPS — FEMALE STRETCHING
-- ─────────────────────────────────────────────

DO $$
DECLARE
  v_mod_id     uuid;
  v_routine_id uuid;
BEGIN
  SELECT id INTO v_mod_id FROM curated_lifestyle_modules WHERE slug = 'stretching-f';

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Morning Wake-Up Stretch', 'daily', 10, 0)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Neck Rolls', 0),
    (v_routine_id, 'Shoulder Circles', 1),
    (v_routine_id, 'Spinal Twists', 2),
    (v_routine_id, 'Hip Openers', 3),
    (v_routine_id, 'Leg Stretches', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Post-Workout Flexibility', 'daily', 15, 1)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Quad Stretch', 0),
    (v_routine_id, 'Hamstring Stretch', 1),
    (v_routine_id, 'Hip Flexor Stretch', 2),
    (v_routine_id, 'Chest Opener', 3),
    (v_routine_id, 'Tricep Stretch', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Evening Wind-Down Stretch', 'daily', 12, 2)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Child''s Pose', 0),
    (v_routine_id, 'Cat-Cow Stretch', 1),
    (v_routine_id, 'Seated Forward Bend', 2),
    (v_routine_id, 'Supine Twist', 3),
    (v_routine_id, 'Legs Up the Wall', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Desk Worker Relief', 'daily', 8, 3)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Neck Stretch', 0),
    (v_routine_id, 'Shoulder Shrugs', 1),
    (v_routine_id, 'Wrist Circles', 2),
    (v_routine_id, 'Standing Back Bend', 3),
    (v_routine_id, 'Hip Circles', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Deep Flexibility Routine', 'weekly', 30, 4)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Full Body Warm-Up', 0),
    (v_routine_id, 'Hold Each Stretch 60s', 1),
    (v_routine_id, 'PNF Stretching', 2),
    (v_routine_id, 'Active Flexibility', 3),
    (v_routine_id, 'Cool Down', 4);

END $$;

-- ─────────────────────────────────────────────
-- 3. ROUTINES + STEPS — MALE SUPPLEMENTS
-- ─────────────────────────────────────────────

DO $$
DECLARE
  v_mod_id     uuid;
  v_routine_id uuid;
BEGIN
  SELECT id INTO v_mod_id FROM curated_lifestyle_modules WHERE slug = 'supplements-m';

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Daily Vitamin Routine', 'daily', 5, 0)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Multivitamin', 0),
    (v_routine_id, 'Vitamin D3', 1),
    (v_routine_id, 'Omega-3 Fish Oil', 2),
    (v_routine_id, 'Magnesium', 3),
    (v_routine_id, 'Zinc', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Pre-Workout Stack', 'daily', 3, 1)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Caffeine', 0),
    (v_routine_id, 'Beta-Alanine', 1),
    (v_routine_id, 'Citrulline Malate', 2),
    (v_routine_id, 'Creatine', 3),
    (v_routine_id, 'BCAAs', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Post-Workout Recovery', 'daily', 5, 2)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Whey Protein Shake', 0),
    (v_routine_id, 'Creatine', 1),
    (v_routine_id, 'Glutamine', 2),
    (v_routine_id, 'Carb Source', 3),
    (v_routine_id, 'Electrolytes', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Sleep Support Stack', 'daily', 5, 3)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Magnesium Glycinate', 0),
    (v_routine_id, 'L-Theanine', 1),
    (v_routine_id, 'Melatonin (if needed)', 2),
    (v_routine_id, 'Chamomile Tea', 3),
    (v_routine_id, 'ZMA', 4);

  INSERT INTO curated_lifestyle_routines (module_id, name, cycle, duration_minutes, sort_order)
  VALUES (v_mod_id, 'Immune & Longevity', 'daily', 5, 4)
  RETURNING id INTO v_routine_id;
  INSERT INTO curated_lifestyle_steps (routine_id, title, sort_order) VALUES
    (v_routine_id, 'Vitamin C', 0),
    (v_routine_id, 'Vitamin D3 + K2', 1),
    (v_routine_id, 'Zinc', 2),
    (v_routine_id, 'Probiotics', 3),
    (v_routine_id, 'CoQ10', 4);

END $$;

-- ─────────────────────────────────────────────
-- 4. BACKFILL EXISTING USERS
-- Only seed users whose id exists in auth.users (valid accounts)
-- ─────────────────────────────────────────────

DO $$
DECLARE
  v_user record;
BEGIN
  FOR v_user IN
    SELECT u.id, u.gender
    FROM users u
    INNER JOIN auth.users au ON au.id = u.id
    WHERE u.gender IN ('female', 'male')
  LOOP
    PERFORM seed_lifestyle_for_user(v_user.id, v_user.gender);
  END LOOP;
END $$;
