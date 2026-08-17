/*
  # Per-user salt for the Password Vault key

  ## Why
  The vault key used to be derived from the user's id. That value is not a
  secret — it sits in the JWT, in uploaded file paths, and in the `user_id`
  column of the very row holding the ciphertext. Anyone able to read
  `password_vault` could therefore derive the key and read every password, so
  the encryption protected nothing against a database dump.

  The key is now derived from the user's PIN, which is never stored (only a
  one-way hash is), combined with the random per-user salt added here. A dump of
  the database no longer contains the key material, and the salt makes each
  account cost its own brute-force attempt.

  ## New Column
  - `users.vault_key_salt` (text, nullable) — base64, 16 random bytes.

  ## Notes
  - Nullable on purpose: existing vaults have no salt yet. The app generates one
    the first time such a user unlocks, re-encrypts their entries under the new
    key, and stores it. Entries written before that keep working through a
    legacy read path.
*/

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS vault_key_salt text;
