/*
# Add user_id column to otp_codes table


## Overview
Adds a `user_id` column to the existing `otp_codes` table to link each verification code
to the specific Supabase Auth user created during registration. This allows the verify-code
edge function to confirm the email directly via updateUserById instead of scanning all users.


## Changes
- Added `user_id` (uuid, references auth.users, ON DELETE CASCADE) column to `otp_codes`
- Added index on `user_id` for faster lookups


## Security
- No policy changes. The table remains server-only (service role access).
*/


DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_codes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE otp_codes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;


CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);

