/*
  # Add Plan Field to Users Table

  ## Summary
  Adds a `plan` column to the `users` table to track each user's subscription status.
  This column is the source of truth for feature access control throughout the app.

  ## Changes
  ### `users` table
  - `plan` (text, NOT NULL, DEFAULT 'free') - Current subscription plan: 'free' or 'pro'

  ## Notes
  1. All existing users default to 'free'.
  2. This field is set to 'pro' by the stripe-webhook Edge Function on successful subscription checkout.
  3. It is reset to 'free' by the webhook on subscription cancellation or expiry.
  4. Users cannot self-modify this field due to RLS; only service-role operations can write it.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'plan'
  ) THEN
    ALTER TABLE users ADD COLUMN plan text NOT NULL DEFAULT 'free';
  END IF;
END $$;
