/*
  # Mark existing seeded rows as curated

  ## Summary
  seed_home_org_for_user was updated (2026-03-30) to set is_curated = true on
  every row it inserts, but that only changed the function — nobody backfilled
  the rows already sitting in organization_tasks for accounts seeded before
  that date. Their curated items still read is_curated = false, so the app's
  "curated items can't be edited or deleted" rule (added alongside this
  migration) does nothing for them.

  ## What this does
  Flips is_curated to true on any organization_tasks row that matches the
  reference content exactly — same section/category id and same title as a row
  in curated_home_org_items. This is not a guess: it is the identical join the
  seed function itself uses to decide what counts as curated, so a row a user
  later added to a curated section under an unrelated title is left alone.

  ## Notes
  - Idempotent: only touches rows that are not already is_curated = true.
  - A user-added item that happens to share both the exact section and the
    exact title of a curated one (re-typing a deleted default, for instance)
    would be swept in too. Given the source is a fixed reference list, this is
    expected to be rare to nonexistent in practice.
*/

UPDATE organization_tasks ot
SET is_curated = true
FROM curated_home_org_items i
WHERE ot.section = i.category_id
  AND ot.title = i.title
  AND ot.is_curated IS NOT TRUE;
