/*
  # Users Audit Log + Data Protection

  ## What This Does

  ### 1. users_audit_log table
  Captures a snapshot every time a row in public.users is INSERT-ed, UPDATE-d, or DELETE-d.
  This means if a profile row ever disappears again, the last known state is preserved here
  and recovery is instant — no need for Supabase PITR or support tickets.

  Columns captured:
  - operation: INSERT / UPDATE / DELETE
  - user_id: the auth UUID of the affected user
  - email: denormalized for quick lookup
  - plan: the plan value at time of change
  - old_data / new_data: full JSONB snapshots before and after
  - changed_at: timestamp

  ### 2. log_user_changes trigger
  Fires AFTER INSERT, UPDATE, DELETE on public.users and writes to users_audit_log.

  ### 3. RLS on users_audit_log
  - Authenticated users can read only their own audit rows (by user_id)
  - Service role has full access for admin recovery operations
  - No user can write to this table directly (append-only via trigger)

  ## Security
  - RLS enabled and restrictive
  - Table is append-only from application perspective
  - Soft-recovery: even a DELETE on users now leaves a recoverable audit row

  ## Notes
  - This does NOT restore already-lost data — it prevents future loss
  - Ava's data loss (March 4 → March 26) predates this table; no recovery possible from this log
*/

CREATE TABLE IF NOT EXISTS public.users_audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation     text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id       uuid,
  email         text,
  plan          text,
  old_data      jsonb,
  new_data      jsonb,
  changed_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit log"
  ON public.users_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to audit log"
  ON public.users_audit_log
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert audit log"
  ON public.users_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.log_user_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users_audit_log (operation, user_id, email, plan, old_data, new_data)
    VALUES ('INSERT', NEW.user_id, NEW.email, NEW.plan, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.users_audit_log (operation, user_id, email, plan, old_data, new_data)
    VALUES ('UPDATE', NEW.user_id, NEW.email, NEW.plan, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.users_audit_log (operation, user_id, email, plan, old_data, new_data)
    VALUES ('DELETE', OLD.user_id, OLD.email, OLD.plan, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_user_changes ON public.users;

CREATE TRIGGER trg_log_user_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_user_changes();

-- Backfill: write the current state of all existing users into the audit log
-- so there is an initial baseline snapshot for every account
INSERT INTO public.users_audit_log (operation, user_id, email, plan, old_data, new_data)
SELECT 
  'INSERT' as operation,
  user_id,
  email,
  plan,
  NULL as old_data,
  to_jsonb(u) as new_data
FROM public.users u
ON CONFLICT DO NOTHING;

-- Index for fast lookups by user_id and time
CREATE INDEX IF NOT EXISTS idx_users_audit_log_user_id ON public.users_audit_log (user_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_audit_log_email ON public.users_audit_log (email, changed_at DESC);
