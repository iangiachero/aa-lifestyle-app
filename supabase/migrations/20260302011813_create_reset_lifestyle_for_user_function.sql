/*
  # Add reset_lifestyle_for_user Function

  ## Overview
  Creates a server-side function that atomically wipes all lifestyle data
  for a given user and re-seeds it based on the new gender. This is called
  when a user changes their gender in the Profile page.

  ## New Functions
  - `reset_lifestyle_for_user(p_user_id uuid, p_gender text)`
    Deletes lifestyle_steps, lifestyle_routines, lifestyle_modules for the user
    then immediately calls seed_lifestyle_for_user with the new gender.
    Runs in a single transaction so there is no partial state on failure.

  ## Security
  - SECURITY DEFINER so the function runs with elevated privileges
  - GRANT EXECUTE to authenticated users only
*/

CREATE OR REPLACE FUNCTION reset_lifestyle_for_user(p_user_id uuid, p_gender text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM lifestyle_steps  WHERE user_id = p_user_id;
  DELETE FROM lifestyle_routines WHERE user_id = p_user_id;
  DELETE FROM lifestyle_modules  WHERE user_id = p_user_id;

  PERFORM seed_lifestyle_for_user(p_user_id, p_gender);
END;
$$;

GRANT EXECUTE ON FUNCTION reset_lifestyle_for_user(uuid, text) TO authenticated;
