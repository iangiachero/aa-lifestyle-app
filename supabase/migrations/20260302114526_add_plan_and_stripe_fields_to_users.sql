/*
  # Add Plan and Stripe Fields to Users Table

  ## Summary
  Adds subscription plan tracking and Stripe integration fields to the existing `users` table.

  ## Changes to Existing Tables

  ### `users` table - 3 new columns added:
  - `plan` (text) - The user's current subscription plan. Values: 'free' or 'pro'. Defaults to 'free'.
  - `stripe_customer_id` (text, nullable) - The Stripe customer ID, stored when a user first subscribes.
  - `stripe_subscription_id` (text, nullable) - The active Stripe subscription ID, used to manage billing portal access and cancellation tracking.

  ## Security
  - No changes to existing RLS policies required; existing policies already allow users to read/update their own row.
  - The `plan` field is updated server-side via the Stripe webhook Edge Function using the service role key, ensuring users cannot self-upgrade without payment.

  ## Notes
  1. All existing users will default to 'free' plan automatically.
  2. The webhook Edge Function will set plan='pro' on successful checkout and plan='free' on subscription cancellation/expiry.
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id text DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id text DEFAULT NULL;
  END IF;
END $$;
