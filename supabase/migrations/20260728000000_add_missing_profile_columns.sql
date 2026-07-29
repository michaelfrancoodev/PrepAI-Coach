-- The onboarding flow saves english_level and coding_level, but these
-- columns were never added to profiles — Postgres silently rejected the
-- whole UPDATE (including onboarding_complete), which is why users got
-- stuck being bounced back to onboarding after finishing it.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS english_level text DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coding_level text DEFAULT 'beginner';
