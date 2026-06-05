/*
  # Reset Lifestyle Data & Fix Seed Function

  ## Overview
  Wipes all per-user lifestyle data (modules, routines, steps) and removes
  the neutral shared modules (Oral Care, Supplements, Medications, Hydration,
  Morning Routine, Night Routine, Stretching) from the seed function.

  Going forward, each user receives exactly 5 gender-specific modules:

  Female: Skin, Hair, Body, Makeup, Nails (25 routines total)
  Male:   Shave, Grooming, Body, Hair, Skin (16 routines total)

  ## Changes
  - DELETE all rows from lifestyle_steps, lifestyle_routines, lifestyle_modules
  - REPLACE seed_lifestyle_for_user to only seed gender modules (no neutral extras)

  ## Notes
  - Existing users will be re-seeded separately after this migration
  - The curated_ template tables are NOT touched
*/

-- ─── Wipe all per-user lifestyle data ────────────────────────────────────────

DELETE FROM lifestyle_steps;
DELETE FROM lifestyle_routines;
DELETE FROM lifestyle_modules;

-- ─── Replace seed function (gender-only, no neutral modules) ─────────────────

CREATE OR REPLACE FUNCTION seed_lifestyle_for_user(p_user_id uuid, p_gender text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gender       text := lower(p_gender);
  v_curated_mod  record;
  v_new_mod_id   uuid;
  v_curated_rout record;
  v_new_rout_id  uuid;
BEGIN
  FOR v_curated_mod IN
    SELECT * FROM curated_lifestyle_modules
    WHERE gender = v_gender
    ORDER BY sort_order
  LOOP
    INSERT INTO lifestyle_modules (user_id, name, image_url, gradient_index, sort_order, is_default, slug)
    VALUES (
      p_user_id,
      v_curated_mod.name,
      v_curated_mod.image_url,
      v_curated_mod.gradient_index,
      v_curated_mod.sort_order,
      true,
      v_curated_mod.slug
    )
    ON CONFLICT (user_id, slug) DO NOTHING
    RETURNING id INTO v_new_mod_id;

    IF v_new_mod_id IS NULL THEN
      SELECT id INTO v_new_mod_id
      FROM lifestyle_modules
      WHERE user_id = p_user_id AND slug = v_curated_mod.slug;
    END IF;

    FOR v_curated_rout IN
      SELECT * FROM curated_lifestyle_routines
      WHERE module_id = v_curated_mod.id
      ORDER BY sort_order
    LOOP
      INSERT INTO lifestyle_routines (user_id, module_id, name, cycle, duration_minutes, sort_order)
      SELECT p_user_id, v_new_mod_id, v_curated_rout.name, v_curated_rout.cycle, v_curated_rout.duration_minutes, v_curated_rout.sort_order
      WHERE NOT EXISTS (
        SELECT 1 FROM lifestyle_routines
        WHERE user_id = p_user_id AND module_id = v_new_mod_id AND name = v_curated_rout.name
      )
      RETURNING id INTO v_new_rout_id;

      IF v_new_rout_id IS NOT NULL THEN
        INSERT INTO lifestyle_steps (user_id, routine_id, title, sort_order)
        SELECT p_user_id, v_new_rout_id, cs.title, cs.sort_order
        FROM curated_lifestyle_steps cs
        WHERE cs.routine_id = v_curated_rout.id
        ORDER BY cs.sort_order;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION seed_lifestyle_for_user(uuid, text) TO authenticated;
