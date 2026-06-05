/*
  # Add vault_pin_hash to users table

  ## Summary
  Adds a `vault_pin_hash` column to the `users` table to store a hashed PIN
  for locking/unlocking the Password Vault feature.

  ## Changes
  - `users` table: new nullable `vault_pin_hash` (text) column
    - Stores the SHA-256 hex digest of the user's chosen vault PIN
    - NULL means the user has not yet set a PIN
    - Never stores the raw PIN value

  ## Notes
  - No RLS changes needed; the column is on the existing `users` table which
    already has RLS policies allowing users to read/update their own row.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'vault_pin_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN vault_pin_hash TEXT;
  END IF;
END $$;
