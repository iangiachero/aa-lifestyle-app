/*
  # Fix CASCADE DELETE on public.users + Recover Missing User Row

  ## Problem
  The foreign key `public.users.user_id → auth.users.id` was set to ON DELETE CASCADE.
  This means if the auth.users row is deleted (or re-created), the public.users profile
  row is silently wiped. This caused ava.amad@gmail.com's profile to disappear even though
  her auth account still exists.

  ## Changes

  ### 1. Fix FK Constraint
  - Drop the existing FK constraint with CASCADE behavior
  - Re-create it with ON DELETE SET NULL so auth deletions do NOT cascade to profile rows

  ### 2. Recover Missing User Row
  - Re-insert the public.users row for ava.amad@gmail.com using her known auth UUID
  - Uses ON CONFLICT DO NOTHING for safety

  ### 3. Update handle_new_user trigger function
  - Switch from plain INSERT to INSERT ... ON CONFLICT (user_id) DO NOTHING
  - Prevents failures if auth row is re-created for an existing email

  ## Security
  - No RLS changes; existing policies remain intact
  - SET NULL on delete means orphaned profiles survive auth-layer deletions
    and can be recovered or cleaned up intentionally rather than silently lost
*/

-- Step 1: Drop and recreate FK with SET NULL instead of CASCADE
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_user_id_fkey;

ALTER TABLE public.users
  ADD CONSTRAINT users_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Step 2: Recover missing user row for ava.amad@gmail.com
INSERT INTO public.users (user_id, email, full_name, plan, created_at, updated_at)
VALUES (
  'bcaced98-384b-4af4-a11e-33b8893fcfaf',
  'ava.amad@gmail.com',
  '',
  'free',
  now(),
  now()
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Update handle_new_user to be upsert-safe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
