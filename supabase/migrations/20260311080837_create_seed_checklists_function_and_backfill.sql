/*
  # Create seed_checklists_for_user function and backfill existing users

  ## Summary
  This migration:
  1. Creates `seed_checklists_for_user(p_user_id uuid)` PL/pgSQL function that copies all 26 curated checklists into user_checklists for a given user
  2. Each checklist gets a category-appropriate color_tag and the curated checklist id as icon_name reference
  3. Function is idempotent: uses INSERT ... ON CONFLICT DO NOTHING keyed on (user_id, name)
  4. Backfills all existing users by calling the function for each existing user

  ## Security
  - Function executes with SECURITY DEFINER so it can insert rows
  - Callable by authenticated users with their own user_id only (enforced at app layer)

  ## Notes
  - Items are stored as JSONB array in user_checklists.items (current schema)
  - color_tag assigned by category: Travel=blue, Events=amber, Home=emerald, Wellness=rose, Productivity=sky, Safety=orange
*/

CREATE OR REPLACE FUNCTION seed_checklists_for_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checklist RECORD;
  v_items JSONB;
BEGIN
  FOR v_checklist IN
    SELECT cc.id, cc.name, cc.icon, cc.category, cc.sort_order
    FROM curated_checklists cc
    ORDER BY cc.sort_order
  LOOP
    SELECT jsonb_agg(ci.title ORDER BY ci.order_index)
    INTO v_items
    FROM curated_checklist_items ci
    WHERE ci.checklist_id = v_checklist.id;

    INSERT INTO user_checklists (user_id, name, items, color_tag, icon_name, category)
    VALUES (
      p_user_id,
      v_checklist.name,
      COALESCE(v_items, '[]'::jsonb),
      CASE v_checklist.category
        WHEN 'Travel'       THEN '#3B82F6'
        WHEN 'Events'       THEN '#F59E0B'
        WHEN 'Home'         THEN '#10B981'
        WHEN 'Wellness'     THEN '#F472B6'
        WHEN 'Productivity' THEN '#0EA5E9'
        WHEN 'Safety'       THEN '#F97316'
        ELSE '#C9A962'
      END,
      v_checklist.id,
      v_checklist.category
    )
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
END;
$$;

-- Add unique constraint on (user_id, name) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_checklists_user_id_name_key'
  ) THEN
    ALTER TABLE user_checklists ADD CONSTRAINT user_checklists_user_id_name_key UNIQUE (user_id, name);
  END IF;
END $$;

-- Backfill all existing users
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM auth.users
  LOOP
    PERFORM seed_checklists_for_user(v_user.id);
  END LOOP;
END $$;
