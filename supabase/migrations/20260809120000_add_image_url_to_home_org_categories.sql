/*
  # Add image_url to home_org_categories

  ## Summary
  Custom Home Organization categories were identified by an Iconify icon picked
  from a search box. The client asked for that to go: the search read as broken
  on a phone, and what she actually wanted was the same treatment as recipes —
  a default image on creation, replaceable with the user's own photo.

  ## New Column
  - `home_org_categories.image_url` (text, nullable) — public URL of the user's
    own photo. NULL means "use the app's default artwork".

  ## Notes
  - The app tolerates this column being absent: the insert/update retries without
    it (PGRST204), exactly as MealPlanning already does for custom recipes. So
    the frontend keeps working before this migration is applied — it just can't
    store a custom photo until then.
  - Photos are uploaded to the existing `public_user_pfp` bucket, the same one
    recipe photos use, so no new bucket or storage policy is required.
*/

ALTER TABLE home_org_categories
  ADD COLUMN IF NOT EXISTS image_url text;
