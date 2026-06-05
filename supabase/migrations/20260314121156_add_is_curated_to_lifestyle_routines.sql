/*
  # Add is_curated flag to lifestyle_routines

  ## Overview
  Adds a boolean `is_curated` column to `lifestyle_routines` to distinguish
  pre-populated (seeded) routines from user-created ones.

  ## Changes

  ### Modified Tables
  - `lifestyle_routines`
    - New column: `is_curated` (boolean, DEFAULT false) — marks routines seeded
      from the curated templates; user-created routines remain false

  ### Updated Functions
  - `seed_lifestyle_for_user` — updated to set `is_curated = true` on all
    routines inserted from curated templates, so future seeds are flagged
    automatically

  ### Backfill
  - Existing routines whose parent module has `is_default = true` are updated
    to `is_curated = true`, covering all already-seeded rows in the database

  ## Notes
  - Pattern is scalable: any routine inserted via the seed function will
    automatically receive `is_curated = true` with no extra work needed
  - The frontend uses this flag to conditionally hide edit/delete icons
  - Modules (categories) are NOT affected — they remain fully editable
*/

-- 1. Add column
ALTER TABLE lifestyle_routines
  ADD COLUMN IF NOT EXISTS is_curated BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill all routines whose parent module was seeded (is_default = true)
UPDATE lifestyle_routines lr
SET is_curated = true
FROM lifestyle_modules lm
WHERE lr.module_id = lm.id
  AND lm.is_default = true;

-- 3. Replace seed function to mark inserted routines as curated
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
      INSERT INTO lifestyle_routines (user_id, module_id, name, cycle, duration_minutes, sort_order, is_curated)
      SELECT p_user_id, v_new_mod_id, v_curated_rout.name, v_curated_rout.cycle, v_curated_rout.duration_minutes, v_curated_rout.sort_order, true
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
