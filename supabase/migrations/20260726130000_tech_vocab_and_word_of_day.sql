-- More tech-vocabulary topics (intermediate/advanced English), and a
-- curated "word of the day" pool for the Dashboard widget.

INSERT INTO curriculum_topics (track, level, order_index, slug, title, description, content) VALUES
('english', 'intermediate', 10, 'en-i10', 'Talking in meetings and code reviews',
 'The specific language used in standups, code reviews, and technical meetings.',
 'WHAT: The particular phrases used inside technical meetings — standups, sprint planning, code review comments — which are more compressed and specific than general conversation.

WHY IT MATTERS: Even fluent English speakers can feel lost in a standup or code review the first time, because this register has its own shorthand.

KEY PHRASES AND USAGE:
- Standup update: "Yesterday I worked on the login flow. Today I''m picking up the API integration. No blockers."
- Blocker: "I''m blocked on the design review before I can continue."
- Code review comment: "Nit: this could be simplified" (nit = nitpick, a minor non-blocking suggestion).
- "LGTM" (looks good to me) — approving a code review.
- "Can you take a pass at this?" — asking someone to review or attempt something.
- "Let''s take this offline" — meaning: discuss separately after the meeting, not now.

PRACTICE PROMPT: Try giving a 15-second standup update about something you worked on today, using this pattern.'),

('english', 'intermediate', 11, 'en-i11', 'Cloud and DevOps vocabulary',
 'Vocabulary for talking about deployment, infrastructure, and cloud services.',
 'WHAT: Vocabulary for how software actually gets built, tested, and run in production — deployment, infrastructure, monitoring.

WHY IT MATTERS: Even frontend-focused developers are expected to talk about this at a basic level in interviews — it shows you understand the full lifecycle of software, not just writing code.

KEY VOCABULARY:
- CI/CD (continuous integration/continuous deployment): "Our CI/CD pipeline runs tests automatically on every pull request."
- Container: "We package the app in a container so it runs the same way everywhere."
- Environment (dev/staging/production): "We test in staging before releasing to production."
- Monitoring/logging: "We use logging to catch errors before users report them."
- Rollback: "If the new version breaks something, we roll back to the previous one."
- Uptime: "The service has had 99.9% uptime this quarter."

PRACTICE PROMPT: Describe, in plain English, what happens between writing code and users seeing it live.'),

('english', 'advanced', 9, 'en-a9', 'Talking about AI and machine learning',
 'Vocabulary and framing for discussing AI/ML concepts in an interview or technical conversation.',
 'WHAT: A working vocabulary for discussing AI/ML at a conceptual level — useful even if you''re not an ML engineer, since it comes up constantly now.

WHY IT MATTERS: Interviewers increasingly ask candidates (in any role) how they''ve used or think about AI tools — vague or overly technical answers both read poorly.

KEY VOCABULARY:
- Model: "The model was trained on a large dataset to recognize patterns."
- Training data: "The quality of training data affects how well the model performs."
- Prompt: "The prompt is the instruction you give the AI to get a response."
- Inference: "Inference is when the trained model is actually used to make a prediction, not trained further."
- Hallucination: "Sometimes the model confidently states something false — that''s called a hallucination."
- Fine-tuning: "Fine-tuning adapts a general model to a specific task using additional training."

PRACTICE PROMPT: Explain, in plain English, how you''ve personally used an AI tool and what its limitations were.'),

('english', 'advanced', 10, 'en-a10', 'Debugging and troubleshooting language',
 'How to narrate a debugging process out loud clearly, the way interviewers want to hear it.',
 'WHAT: The specific language for narrating a debugging or troubleshooting process — "what did you try, what did you learn, what fixed it."

WHY IT MATTERS: Technical interviews often ask you to debug something live or describe a past debugging story — the narration matters as much as the fix itself.

USEFUL STRUCTURE AND PHRASES:
- Hypothesis: "My first hypothesis was that the issue was in the database query."
- Isolating the problem: "I isolated the issue by removing components one at a time until it stopped happening."
- Root cause: "The root cause turned out to be a race condition, not the query itself."
- Reproducing: "I couldn''t fix it until I could reliably reproduce it."

PRACTICE PROMPT: Narrate out loud, step by step, how you debugged a real problem you''ve faced — using at least three of these phrases.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Word of the Day pool — a curated set of useful interview/tech words.
-- The app picks one deterministically per calendar day (same word all day
-- for everyone, different word each day) with zero AI calls.
-- ============================================================

CREATE TABLE IF NOT EXISTS word_of_day_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  meaning text NOT NULL,
  example text NOT NULL,
  category text NOT NULL CHECK (category IN ('interview', 'tech', 'general'))
);
ALTER TABLE word_of_day_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_can_read_words" ON word_of_day_pool;
CREATE POLICY "anyone_can_read_words" ON word_of_day_pool FOR SELECT TO authenticated USING (true);

INSERT INTO word_of_day_pool (word, meaning, example, category) VALUES
('Articulate', 'To express an idea clearly and effectively in words.', 'She articulated her reasoning so clearly the interviewer had no follow-up questions.', 'interview'),
('Concise', 'Giving information clearly, in few words; not wordy.', 'Try to keep your answers concise — 60-90 seconds, not five minutes.', 'interview'),
('Rationale', 'The set of reasons or logical basis for a decision.', 'Can you walk me through the rationale behind that architecture choice?', 'interview'),
('Trade-off', 'A balance between two desirable but conflicting options.', 'There''s a trade-off between speed and accuracy in this approach.', 'tech'),
('Scalable', 'Able to handle growth in size, users, or load without breaking.', 'We chose this database because it''s more scalable for our growth plans.', 'tech'),
('Latency', 'The delay before a system responds after a request.', 'High latency made the app feel sluggish even though it never crashed.', 'tech'),
('Refactor', 'To restructure existing code without changing its external behavior.', 'We refactored the module to make it easier to test.', 'tech'),
('Deprecated', 'No longer recommended for use, though it may still work.', 'That API is deprecated — we should migrate to the new one.', 'tech'),
('Idempotent', 'An operation that produces the same result no matter how many times it''s run.', 'We made the payment endpoint idempotent to avoid double charges on retry.', 'tech'),
('Ambiguity', 'A lack of clarity; something open to more than one interpretation.', 'System design interviews deliberately include ambiguity to see how you clarify requirements.', 'interview'),
('Candid', 'Honest and direct, without being harsh.', 'Being candid about a mistake you made shows maturity in an interview.', 'interview'),
('Proactive', 'Taking initiative before being asked, rather than only reacting.', 'I proactively flagged the risk before it became a bigger issue.', 'interview'),
('Bottleneck', 'The point in a system or process that limits overall performance.', 'The database was the bottleneck, so we added caching in front of it.', 'tech'),
('Iterate', 'To repeat a process, improving it a little each time.', 'We iterated on the design three times based on user feedback.', 'tech'),
('Onboarding', 'The process of getting a new person set up and productive.', 'A good onboarding process gets new engineers shipping code in their first week.', 'general'),
('Stakeholder', 'A person with an interest in or affected by a decision or project.', 'I gathered feedback from every stakeholder before finalizing the design.', 'general'),
('Ownership', 'Taking full responsibility for a task or outcome, not just doing the minimum.', 'What I''m proudest of is the ownership I took over that failing service.', 'interview'),
('Edge case', 'A rare or extreme situation that a system must still handle correctly.', 'What edge case would break this if the input list is empty?', 'tech'),
('Throughput', 'The amount of work or data a system processes in a given time.', 'We increased throughput by processing requests in parallel.', 'tech'),
('Redundancy', 'Duplicate components so a system keeps working if one part fails.', 'We added redundancy so a single server failure doesn''t take the whole app down.', 'tech')
ON CONFLICT (word) DO NOTHING;
