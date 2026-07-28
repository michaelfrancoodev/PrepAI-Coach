-- ============================================================
-- Mastery Engine: structured curriculum + spaced repetition
-- ============================================================
-- curriculum_topics: a shared, hand-authored map of what "0 to 100"
--   actually means in each track (english / coding / interview),
--   broken into beginner -> intermediate -> advanced, in learning order.
-- user_mastery: one row per (user, topic) tracking a 0-100 score and
--   a spaced-repetition schedule (SM-2-lite: ease factor + interval
--   grow/shrink based on how well the user did last time), so topics
--   the user is shaky on come back for review before they're forgotten.

CREATE TABLE IF NOT EXISTS curriculum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL CHECK (track IN ('english', 'coding', 'interview')),
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  order_index int NOT NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  -- Links this topic to something concrete elsewhere in the app:
  -- a coding category key (e.g. 'arrays'), an interview mode
  -- (e.g. 'interview_behavioral'), or null for pure-English topics.
  ref_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE curriculum_topics ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_curriculum_track_level_order ON curriculum_topics(track, level, order_index);

DROP POLICY IF EXISTS "anyone_can_read_curriculum" ON curriculum_topics;
CREATE POLICY "anyone_can_read_curriculum" ON curriculum_topics FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES curriculum_topics(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'learning', 'review', 'mastered')),
  review_count int NOT NULL DEFAULT 0,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days numeric NOT NULL DEFAULT 1,
  last_reviewed_at timestamptz,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);
ALTER TABLE user_mastery ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mastery_user ON user_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_mastery_due ON user_mastery(user_id, next_review_at);

DROP POLICY IF EXISTS "select_own_mastery" ON user_mastery;
CREATE POLICY "select_own_mastery" ON user_mastery FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mastery" ON user_mastery;
CREATE POLICY "insert_own_mastery" ON user_mastery FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mastery" ON user_mastery;
CREATE POLICY "update_own_mastery" ON user_mastery FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mastery" ON user_mastery;
CREATE POLICY "delete_own_mastery" ON user_mastery FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Seed curriculum: ENGLISH (beginner -> intermediate -> advanced)
-- ------------------------------------------------------------
INSERT INTO curriculum_topics (track, level, order_index, slug, title, description) VALUES
('english', 'beginner', 1, 'en-b1', 'Introducing yourself', 'Say your name, role, and background in clear, simple sentences without hesitation.'),
('english', 'beginner', 2, 'en-b2', 'Present tense for daily work', 'Describe what you do day-to-day using simple present tense correctly.'),
('english', 'beginner', 3, 'en-b3', 'Core interview vocabulary', 'Learn and use words like "responsibility", "experience", "skill", "achievement" naturally.'),
('english', 'beginner', 4, 'en-b4', 'Asking for clarification', 'Politely ask an interviewer to repeat or explain a question you didn''t catch.'),
('english', 'beginner', 5, 'en-b5', 'Numbers, dates and time', 'Say years of experience, dates, and durations correctly and confidently.'),
('english', 'beginner', 6, 'en-b6', 'Past tense for experience', 'Describe past jobs and projects accurately using simple past tense.'),
('english', 'beginner', 7, 'en-b7', 'Short STAR answers', 'Give a short, complete answer with Situation, Task, Action, Result — even if simple.'),
('english', 'beginner', 8, 'en-b8', 'Cutting filler words', 'Notice and reduce "um", "like", "you know" so answers sound more confident.'),

('english', 'intermediate', 1, 'en-i1', 'Achievements with numbers', 'Back up accomplishments with specific, believable metrics ("reduced load time by 30%").'),
('english', 'intermediate', 2, 'en-i2', 'Comparatives for strengths', 'Describe strengths and growth using comparative language naturally.'),
('english', 'intermediate', 3, 'en-i3', 'Handling follow-up questions', 'Stay composed and coherent when the interviewer digs deeper into your answer.'),
('english', 'intermediate', 4, 'en-i4', 'Describing conflict and challenges', 'Talk about a disagreement or setback professionally, without blaming others.'),
('english', 'intermediate', 5, 'en-i5', 'Explaining technical ideas simply', 'Describe a technical concept so a non-technical interviewer understands it.'),
('english', 'intermediate', 6, 'en-i6', 'Salary and negotiation language', 'Discuss compensation and expectations with confident, professional phrasing.'),
('english', 'intermediate', 7, 'en-i7', 'Full STAR fluency', 'Deliver a complete, well-paced STAR answer without long pauses or restarts.'),
('english', 'intermediate', 8, 'en-i8', 'Natural pacing under pressure', 'Keep a steady, natural speaking pace even when nervous or rushed.'),

('english', 'advanced', 1, 'en-a1', 'Executive-level framing', 'Frame your impact the way a senior leader would — outcomes and ownership first.'),
('english', 'advanced', 2, 'en-a2', 'Persuasive storytelling', 'Structure an answer as a compelling narrative, not just a list of facts.'),
('english', 'advanced', 3, 'en-a3', 'Handling curveball questions', 'Stay composed and think out loud clearly on questions you didn''t prepare for.'),
('english', 'advanced', 4, 'en-a4', 'Cross-cultural communication', 'Adjust tone and directness appropriately for different interviewer styles.'),
('english', 'advanced', 5, 'en-a5', 'Deep technical articulation', 'Go deep on a technical topic with precise, advanced vocabulary.'),
('english', 'advanced', 6, 'en-a6', 'Leadership narratives', 'Tell a credible leadership or mentorship story with nuance.'),
('english', 'advanced', 7, 'en-a7', 'Concise answers under pressure', 'Compress a complex answer into a tight, high-signal summary when time is short.'),
('english', 'advanced', 8, 'en-a8', 'Idiomatic, native-level fluency', 'Use natural idioms and phrasing that sound native, not textbook.')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- Seed curriculum: CODING (mapped to real categories in codingData.ts)
-- ------------------------------------------------------------
INSERT INTO curriculum_topics (track, level, order_index, slug, title, description, ref_key) VALUES
('coding', 'beginner', 1, 'cd-b1', 'Arrays', 'Indexing, iteration, and in-place manipulation — the base of almost everything else.', 'arrays'),
('coding', 'beginner', 2, 'cd-b2', 'Strings', 'Parsing, matching, and character-level manipulation.', 'strings'),
('coding', 'beginner', 3, 'cd-b3', 'Hash tables', 'Counting, lookups, and grouping in O(1) average time.', 'hash-tables'),
('coding', 'beginner', 4, 'cd-b4', 'Two pointers', 'Paired traversal and invariant-based scanning.', 'two-pointers'),

('coding', 'intermediate', 1, 'cd-i1', 'Sliding window', 'Fixed and dynamic window problems over arrays and strings.', 'sliding-window'),
('coding', 'intermediate', 2, 'cd-i2', 'Linked lists', 'Pointer manipulation, reversal, and cycle detection.', 'linked-lists'),
('coding', 'intermediate', 3, 'cd-i3', 'Binary search', 'Searching sorted data and answer-space search patterns.', 'binary-search'),
('coding', 'intermediate', 4, 'cd-i4', 'Recursion', 'Divide-and-conquer thinking and recursive problem breakdown.', 'recursion'),

('coding', 'advanced', 1, 'cd-a1', 'Trees', 'Traversal, height, and balanced-tree operations.', 'trees'),
('coding', 'advanced', 2, 'cd-a2', 'Graphs', 'BFS, DFS, shortest path, and connectivity problems.', 'graphs'),
('coding', 'advanced', 3, 'cd-a3', 'Dynamic programming', 'Recognizing overlapping subproblems and memoization.', 'dynamic-programming'),
('coding', 'advanced', 4, 'cd-a4', 'Bit manipulation', 'XOR tricks, masks, and low-level bit operations.', 'bit-manipulation')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- Seed curriculum: INTERVIEW READINESS (mapped to real AI modes)
-- ------------------------------------------------------------
INSERT INTO curriculum_topics (track, level, order_index, slug, title, description, ref_key) VALUES
('interview', 'beginner', 1, 'iv-b1', 'HR screening basics', 'Handle the first-round recruiter call: background, motivation, logistics.', 'interview_hr'),
('interview', 'beginner', 2, 'iv-b2', 'Simple behavioral answers', 'Answer common behavioral questions with a basic, complete structure.', 'interview_behavioral'),
('interview', 'beginner', 3, 'iv-b3', 'Explaining your own code', 'Walk through code you already wrote, clearly and calmly.', 'interview_technical'),
('interview', 'beginner', 4, 'iv-b4', 'Interview etiquette', 'Timing, follow-up questions, and how to end an interview well.', 'interview_hr'),

('interview', 'intermediate', 1, 'iv-i1', 'Full technical rounds', 'Solve and explain a live coding problem end-to-end under time pressure.', 'interview_technical'),
('interview', 'intermediate', 2, 'iv-i2', 'STAR-based behavioral depth', 'Handle behavioral follow-ups that probe deeper into your first answer.', 'interview_behavioral'),
('interview', 'intermediate', 3, 'iv-i3', 'Trade-off discussions', 'Justify technical decisions and discuss trade-offs out loud.', 'interview_technical'),
('interview', 'intermediate', 4, 'iv-i4', 'Company-specific prep', 'Adapt your answers to a specific company''s values and interview style.', 'interview_company'),

('interview', 'advanced', 1, 'iv-a1', 'System design fundamentals', 'Design a scalable system from requirements to high-level architecture.', 'interview_system_design'),
('interview', 'advanced', 2, 'iv-a2', 'System design deep dives', 'Handle deep follow-ups on bottlenecks, scaling, and failure modes.', 'interview_system_design'),
('interview', 'advanced', 3, 'iv-a3', 'Leadership and conflict rounds', 'Handle senior-level behavioral questions about leading and resolving conflict.', 'interview_behavioral'),
('interview', 'advanced', 4, 'iv-a4', 'Full mock — start to finish', 'A complete, realistic mock interview combining every skill above.', 'interview_company')
ON CONFLICT (slug) DO NOTHING;
