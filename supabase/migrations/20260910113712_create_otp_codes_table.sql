/*
# Create otp_codes table for 6-digit email verification

## Overview
Replaces the Supabase generateLink-based OTP system with a custom 6-digit code system.
Codes are stored in the database with expiration, attempt limits, and invalidation on resend.

## New Tables
### `otp_codes`
- `id` (uuid, primary key)
- `email` (text, not null) - The email address being verified
- `code` (text, not null) - The 6-digit numeric code
- `expires_at` (timestamptz, not null) - When the code expires (10 minutes)
- `attempts` (integer, default 0) - Number of failed verification attempts
- `max_attempts` (integer, default 5) - Maximum allowed attempts before code is rejected
- `used` (boolean, default false) - Whether the code has been successfully used
- `created_at` (timestamptz, default now())

## Security
- RLS enabled. Only the server (service role) reads/writes this table.
- No policies for anon or authenticated roles — the table is server-only.
*/

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- No policies: this table is only accessed via the service role key in edge functions.
-- The anon and authenticated roles get no access.

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
