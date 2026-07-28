/*
# Update default voice to browser-compatible value

## Summary
Updates the default `ai_settings->voice` from `alloy` (an OpenAI TTS voice name)
to `default` so it works with the browser's built-in speechSynthesis API.
Non-destructive — only changes the column DEFAULT for future inserts.
*/

ALTER TABLE profiles
  ALTER COLUMN ai_settings SET DEFAULT
  '{"model":"gemini-2.5-flash","temperature":0.7,"voice":"default","speed":1}'::jsonb;
