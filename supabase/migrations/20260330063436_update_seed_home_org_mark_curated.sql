/*
  # Update seed_home_org_for_user to set is_curated = true

  ## Summary
  Updates the existing seed function so all tasks inserted during seeding
  are marked as is_curated = true. This ensures future new users get properly
  protected curated content.

  ## Changes
  - Replaces `seed_home_org_for_user` function body to include `is_curated = true`
    in the INSERT statement
*/

CREATE OR REPLACE FUNCTION seed_home_org_for_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO organization_tasks (user_id, section, title, icon, sub_tasks, color_tag, completed, is_curated)
  SELECT
    p_user_id,
    c.id,
    i.title,
    c.icon_name,
    '[]'::jsonb,
    c.color_tag,
    false,
    true
  FROM curated_home_org_categories c
  JOIN curated_home_org_items i ON i.category_id = c.id
  ORDER BY c.sort_order, i.order_index
  ON CONFLICT (user_id, section, title) DO NOTHING;
END;
$$;
