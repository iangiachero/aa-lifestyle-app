/*
  # Fix users table RLS column reference

  ## Problem
  The previous security migration incorrectly compared auth.uid() against the `id` column
  (a random internal primary key) instead of the `user_id` column (the Supabase auth UUID).

  The users table has two UUID columns:
  - `id` - random internal primary key (NOT the auth UUID)
  - `user_id` - the Supabase auth.uid() value (the correct column to compare against)

  This caused all authenticated users to be unable to read their own profile rows,
  resulting in silent empty results and no user data displaying in the UI.

  ## Fix
  Recreate the three users table policies comparing (select auth.uid()) against user_id.
*/

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
