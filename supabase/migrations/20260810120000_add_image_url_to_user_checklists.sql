/*
  # Add image_url to user_checklists

  ## Summary
  Curated checklists have artwork; a checklist the user creates had none, so it
  fell back to a plain icon. The client asked for the same treatment recipes get
  — a default image on creation, replaceable with a photo of your own — for both
  the "Mine" checklists and Home Organization categories. This is the checklist
  half; home_org_categories.image_url covers the other.

  ## New Column
  - `user_checklists.image_url` (text, nullable) — public URL of the user's own
    photo. NULL means "use the app's default artwork".

  ## Notes
  - The app tolerates this column being absent: the insert retries without it
    (PGRST204), as MealPlanning already does for custom recipes, so nothing
    breaks before the migration is applied — the photo simply isn't stored.
  - Photos go to the existing `public_user_pfp` bucket, the same one recipe and
    category photos use, so no new bucket or storage policy is needed.
*/

ALTER TABLE user_checklists
  ADD COLUMN IF NOT EXISTS image_url text;
