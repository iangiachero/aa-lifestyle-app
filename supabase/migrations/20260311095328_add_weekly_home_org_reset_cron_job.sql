/*
  # Add Weekly Home Organization Reset via pg_cron

  ## Summary
  Creates a function that resets all home organization task completion states
  to false every Sunday at midnight UTC. This gives users a fresh weekly
  checklist every week across all 21 categories simultaneously.

  ## New Functions
  - `reset_home_org_weekly()` - Sets completed = false for ALL organization_tasks rows

  ## Scheduled Jobs
  - `weekly-home-org-reset`: runs every Sunday at midnight UTC (0 0 * * 0)

  ## Notes
  - pg_cron is already enabled from a previous migration
  - Resets ALL categories simultaneously, all at once on Sunday midnight UTC
  - Only affects the completed flag; tasks themselves are never deleted
  - Idempotent: safe to run multiple times
*/

CREATE OR REPLACE FUNCTION reset_home_org_weekly()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE organization_tasks
  SET completed = false, updated_at = now()
  WHERE completed = true;
END;
$$;

SELECT cron.schedule(
  'weekly-home-org-reset',
  '0 0 * * 0',
  'SELECT reset_home_org_weekly()'
);
