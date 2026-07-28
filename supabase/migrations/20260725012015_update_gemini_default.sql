/*
# Update AI model default to Gemini

## Summary
Updates the default value of `profiles.ai_settings->model` from `gpt-4o-mini` to
`gemini-2.5-flash` so that new signups use the Gemini free model by default.
This is a non-destructive change — existing rows keep their current values; only
the column DEFAULT changes for future inserts.

## Changes
- Replaces the `ai_settings` column default on `profiles`.
- Existing profile rows are NOT modified (their model stays whatever was set).
*/

ALTER TABLE profiles
  ALTER COLUMN ai_settings SET DEFAULT
  '{"model":"gemini-2.5-flash","temperature":0.7,"voice":"alloy","speed":1}'::jsonb;
