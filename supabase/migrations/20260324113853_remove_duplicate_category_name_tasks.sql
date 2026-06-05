/*
  # Remove Duplicate Category Name Tasks from Home Organization

  ## Problem
  Some users have `organization_tasks` rows where `title` exactly matches the 
  display name of the category (section). These appear as a duplicate first item 
  in the checklist UI, because the category header already shows the name.

  ## Changes
  - Deletes all tasks whose title matches the known category display name for 
    each of the 21 Home Organization categories.
  - Only affects exact matches between task title and category display name.
  - Does NOT delete any other user tasks.

  ## Affected sections (known duplicates found)
  - daily-reset-adhd → "Daily Reset (ADHD Quick Wins)"
  - weekly-cleaning → "Weekly Cleaning"
  - kitchen-organization → "Kitchen Organization"
  - bedroom-organization → "Bedroom Organization"
  - (and all other categories as a precaution)
*/

DELETE FROM organization_tasks
WHERE (section = 'daily-reset-adhd'          AND title = 'Daily Reset (ADHD Quick Wins)')
   OR (section = 'weekly-cleaning'            AND title = 'Weekly Cleaning')
   OR (section = 'monthly-deep-clean'         AND title = 'Monthly Deep Clean')
   OR (section = 'seasonal-reset'             AND title = 'Seasonal Reset')
   OR (section = 'kitchen-organization'       AND title = 'Kitchen Organization')
   OR (section = 'pantry-organization'        AND title = 'Pantry Organization')
   OR (section = 'refrigerator-freezer'       AND title = 'Refrigerator & Freezer')
   OR (section = 'bedroom-organization'       AND title = 'Bedroom Organization')
   OR (section = 'closet-organization'        AND title = 'Closet Organization')
   OR (section = 'bathroom-organization'      AND title = 'Bathroom Organization')
   OR (section = 'linen-closet'               AND title = 'Linen Closet')
   OR (section = 'laundry-room'               AND title = 'Laundry Room')
   OR (section = 'living-room-common-areas'   AND title = 'Living Room / Common Areas')
   OR (section = 'entryway-mudroom'           AND title = 'Entryway / Mudroom')
   OR (section = 'home-office-desk'           AND title = 'Home Office / Desk')
   OR (section = 'storage-areas'              AND title = 'Storage Areas')
   OR (section = 'garage'                     AND title = 'Garage')
   OR (section = 'under-bed-hidden-storage'   AND title = 'Under-Bed / Hidden Storage')
   OR (section = 'digital-home-organization'  AND title = 'Digital Home Organization')
   OR (section = 'decluttering-donation-prep' AND title = 'Decluttering & Donation Prep')
   OR (section = 'moving-reset-checklist'     AND title = 'Moving / Reset Checklist');
