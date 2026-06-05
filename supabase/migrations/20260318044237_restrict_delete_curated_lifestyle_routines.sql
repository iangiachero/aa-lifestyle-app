/*
  # Restrict deletion of curated lifestyle routines

  ## Changes
  - Drop the existing DELETE policy on lifestyle_routines
  - Re-create it with an additional check: is_curated must be false
  - This prevents any authenticated user from deleting seed/curated routines,
    even if they bypass the frontend UI (e.g., via DevTools or direct API calls)

  ## Security
  - Only user-created routines (is_curated = false) can be deleted
  - Curated routines are permanently protected at the database level
*/

DROP POLICY IF EXISTS "Users can delete own routines" ON lifestyle_routines;

CREATE POLICY "Users can delete own non-curated routines"
  ON lifestyle_routines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_curated = false);
