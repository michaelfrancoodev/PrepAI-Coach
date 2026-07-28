/*
# None Coach — Core Schema

## Summary
Creates the foundational tables for the None Coach AI interview & English speaking
application. All tables are owner-scoped (per authenticated user) with RLS enabled,
so each user only ever sees their own data.

## New Tables
1. `profiles` — extended user data (display name, avatar, experience level, goals,
   preferred companies, onboarding state, AI settings, voice settings).
2. `onboarding_answers` — saved answers from the multi-step onboarding flow
   (English assessment, coding assessment, experience level, goals, companies).
3. `roadmaps` — AI-generated personalized learning roadmaps (JSONB structure).
4. `practice_sessions` — a single practice/interview session (type, category,
   difficulty, score, feedback, transcript, status, duration).
5. `session_messages` — individual messages inside a session (role, content,
   optional voice/audio reference).
6. `code_submissions` — code written during coding practice / coding interviews
   (problem slug, language, code, test results, AI review).
7. `vocabulary_items` — words the user is learning (front, back, example, mastery).
8. `flashcards` — spaced-repetition flashcards (front, back, interval, ease,
   next review).
9. `mistakes` — logged mistakes (category, prompt, user answer, correction,
   explanation) for review.
10. `bookmarks` — saved resources/problems/notes (type, title, url, note).
11. `daily_missions` — daily AI-generated mission (date, tasks JSONB, completed).
12. `notifications` — in-app notifications (type, title, body, read).
13. `skill_scores` — per-skill score history (skill, score, recorded_at) for charts.
14. `achievements` — unlocked achievements (key, title, unlocked_at).
15. `ai_memory` — long-term memory entries the AI coach keeps about the user
   (key, value, importance).

## Security
- RLS enabled on EVERY table.
- Every policy is `TO authenticated` with an ownership check against `user_id`
  (which defaults to `auth.uid()` so client inserts that omit `user_id` succeed).
- Four separate policies per table (SELECT / INSERT / UPDATE / DELETE).
- `profiles` is keyed by `id = auth.users.id` (one row per user) and uses
  `auth.uid() = id` as the ownership predicate.
- Onboarding + roadmap rows are cascaded when the owning profile is deleted.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  experience_level text DEFAULT 'beginner',
  goals text[] DEFAULT '{}',
  preferred_companies text[] DEFAULT '{}',
  target_role text,
  timezone text DEFAULT 'UTC',
  onboarding_complete boolean NOT NULL DEFAULT false,
  onboarding_step int NOT NULL DEFAULT 0,
  ai_settings jsonb NOT NULL DEFAULT '{"model":"gpt-4o-mini","temperature":0.7,"voice":"alloy","speed":1}'::jsonb,
  voice_settings jsonb NOT NULL DEFAULT '{"recognition":"webkit","auto_listen":true,"silence_threshold":1500}'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{"theme":"system","notifications":true,"email_digest":true}'::jsonb,
  streak_count int NOT NULL DEFAULT 0,
  last_active_date date,
  total_minutes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ---------- onboarding_answers ----------
CREATE TABLE IF NOT EXISTS onboarding_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  step text NOT NULL,
  answer jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE onboarding_answers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_answers(user_id);

DROP POLICY IF EXISTS "select_own_onboarding" ON onboarding_answers;
CREATE POLICY "select_own_onboarding" ON onboarding_answers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_onboarding" ON onboarding_answers;
CREATE POLICY "insert_own_onboarding" ON onboarding_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_onboarding" ON onboarding_answers;
CREATE POLICY "update_own_onboarding" ON onboarding_answers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_onboarding" ON onboarding_answers;
CREATE POLICY "delete_own_onboarding" ON onboarding_answers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- roadmaps ----------
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);

DROP POLICY IF EXISTS "select_own_roadmaps" ON roadmaps;
CREATE POLICY "select_own_roadmaps" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_roadmaps" ON roadmaps;
CREATE POLICY "insert_own_roadmaps" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_roadmaps" ON roadmaps;
CREATE POLICY "update_own_roadmaps" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_roadmaps" ON roadmaps;
CREATE POLICY "delete_own_roadmaps" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- practice_sessions ----------
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text NOT NULL,
  title text,
  difficulty text DEFAULT 'medium',
  status text NOT NULL DEFAULT 'in_progress',
  score int,
  max_score int DEFAULT 100,
  feedback jsonb DEFAULT '{}'::jsonb,
  transcript jsonb DEFAULT '[]'::jsonb,
  ai_notes jsonb DEFAULT '[]'::jsonb,
  duration_seconds int DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON practice_sessions(type, category);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON practice_sessions(started_at DESC);

DROP POLICY IF EXISTS "select_own_sessions" ON practice_sessions;
CREATE POLICY "select_own_sessions" ON practice_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_sessions" ON practice_sessions;
CREATE POLICY "insert_own_sessions" ON practice_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_sessions" ON practice_sessions;
CREATE POLICY "update_own_sessions" ON practice_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_sessions" ON practice_sessions;
CREATE POLICY "delete_own_sessions" ON practice_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- session_messages ----------
CREATE TABLE IF NOT EXISTS session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  audio_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_session ON session_messages(session_id, created_at);

DROP POLICY IF EXISTS "select_own_messages" ON session_messages;
CREATE POLICY "select_own_messages" ON session_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_messages" ON session_messages;
CREATE POLICY "insert_own_messages" ON session_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_messages" ON session_messages;
CREATE POLICY "update_own_messages" ON session_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_messages" ON session_messages;
CREATE POLICY "delete_own_messages" ON session_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- code_submissions ----------
CREATE TABLE IF NOT EXISTS code_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES practice_sessions(id) ON DELETE SET NULL,
  problem_slug text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL DEFAULT '',
  test_results jsonb DEFAULT '{}'::jsonb,
  ai_review jsonb DEFAULT '{}'::jsonb,
  passed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_code_user ON code_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_problem ON code_submissions(problem_slug);

DROP POLICY IF EXISTS "select_own_code" ON code_submissions;
CREATE POLICY "select_own_code" ON code_submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_code" ON code_submissions;
CREATE POLICY "insert_own_code" ON code_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_code" ON code_submissions;
CREATE POLICY "update_own_code" ON code_submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_code" ON code_submissions;
CREATE POLICY "delete_own_code" ON code_submissions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- vocabulary_items ----------
CREATE TABLE IF NOT EXISTS vocabulary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  word text NOT NULL,
  definition text,
  example text,
  part_of_speech text,
  mastery int NOT NULL DEFAULT 0,
  review_count int NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_vocab_user ON vocabulary_items(user_id);

DROP POLICY IF EXISTS "select_own_vocab" ON vocabulary_items;
CREATE POLICY "select_own_vocab" ON vocabulary_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_vocab" ON vocabulary_items;
CREATE POLICY "insert_own_vocab" ON vocabulary_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_vocab" ON vocabulary_items;
CREATE POLICY "update_own_vocab" ON vocabulary_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_vocab" ON vocabulary_items;
CREATE POLICY "delete_own_vocab" ON vocabulary_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- flashcards ----------
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  deck text NOT NULL DEFAULT 'general',
  front text NOT NULL,
  back text NOT NULL,
  hint text,
  interval_days int NOT NULL DEFAULT 1,
  ease_factor real NOT NULL DEFAULT 2.5,
  repetitions int NOT NULL DEFAULT 0,
  next_review date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id, next_review);

DROP POLICY IF EXISTS "select_own_flashcards" ON flashcards;
CREATE POLICY "select_own_flashcards" ON flashcards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_flashcards" ON flashcards;
CREATE POLICY "insert_own_flashcards" ON flashcards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_flashcards" ON flashcards;
CREATE POLICY "update_own_flashcards" ON flashcards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_flashcards" ON flashcards;
CREATE POLICY "delete_own_flashcards" ON flashcards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- mistakes ----------
CREATE TABLE IF NOT EXISTS mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  prompt text,
  user_answer text,
  correction text,
  explanation text,
  reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id);

DROP POLICY IF EXISTS "select_own_mistakes" ON mistakes;
CREATE POLICY "select_own_mistakes" ON mistakes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mistakes" ON mistakes;
CREATE POLICY "insert_own_mistakes" ON mistakes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mistakes" ON mistakes;
CREATE POLICY "update_own_mistakes" ON mistakes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mistakes" ON mistakes;
CREATE POLICY "delete_own_mistakes" ON mistakes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- bookmarks ----------
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  url text,
  note text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookmarks" ON bookmarks;
CREATE POLICY "update_own_bookmarks" ON bookmarks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- daily_missions ----------
CREATE TABLE IF NOT EXISTS daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  mission_date date NOT NULL DEFAULT CURRENT_DATE,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_count int NOT NULL DEFAULT 0,
  total_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_user_date ON daily_missions(user_id, mission_date);

DROP POLICY IF EXISTS "select_own_missions" ON daily_missions;
CREATE POLICY "select_own_missions" ON daily_missions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_missions" ON daily_missions;
CREATE POLICY "insert_own_missions" ON daily_missions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_missions" ON daily_missions;
CREATE POLICY "update_own_missions" ON daily_missions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_missions" ON daily_missions;
CREATE POLICY "delete_own_missions" ON daily_missions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- skill_scores ----------
CREATE TABLE IF NOT EXISTS skill_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill text NOT NULL,
  score int NOT NULL DEFAULT 0,
  max_score int NOT NULL DEFAULT 100,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE skill_scores ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_skill_user ON skill_scores(user_id, skill, recorded_at);

DROP POLICY IF EXISTS "select_own_skills" ON skill_scores;
CREATE POLICY "select_own_skills" ON skill_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_skills" ON skill_scores;
CREATE POLICY "insert_own_skills" ON skill_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_skills" ON skill_scores;
CREATE POLICY "update_own_skills" ON skill_scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_skills" ON skill_scores;
CREATE POLICY "delete_own_skills" ON skill_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- achievements ----------
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

DROP POLICY IF EXISTS "select_own_achievements" ON achievements;
CREATE POLICY "select_own_achievements" ON achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_achievements" ON achievements;
CREATE POLICY "insert_own_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_achievements" ON achievements;
CREATE POLICY "update_own_achievements" ON achievements FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_achievements" ON achievements;
CREATE POLICY "delete_own_achievements" ON achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- ai_memory ----------
CREATE TABLE IF NOT EXISTS ai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  importance int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_memory_user ON ai_memory(user_id);

DROP POLICY IF EXISTS "select_own_memory" ON ai_memory;
CREATE POLICY "select_own_memory" ON ai_memory FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_memory" ON ai_memory;
CREATE POLICY "insert_own_memory" ON ai_memory FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_memory" ON ai_memory;
CREATE POLICY "update_own_memory" ON ai_memory FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_memory" ON ai_memory;
CREATE POLICY "delete_own_memory" ON ai_memory FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
