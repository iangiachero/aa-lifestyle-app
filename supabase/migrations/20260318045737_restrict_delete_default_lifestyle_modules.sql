/*
  # Restrict deletion of default lifestyle modules

  ## Summary
  Prevents users from deleting curated/default lifestyle modules via the API,
  even if they bypass the frontend UI.

  ## Changes
  - Drops the existing DELETE policy on lifestyle_modules (if any)
  - Creates a new DELETE policy that only allows deletion of modules where is_default = false
*/

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete own modules" ON lifestyle_modules;
  DROP POLICY IF EXISTS "Users can delete their modules" ON lifestyle_modules;
END $$;

CREATE POLICY "Users can delete own non-default modules"
  ON lifestyle_modules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);
