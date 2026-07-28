-- Adds a "content" column carrying the actual lesson body for each topic —
-- what it is, why it matters, and where/how it's used — so learning happens
-- BEFORE practice, not just a title with no teaching behind it.

ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS content text;

-- ============================================================
-- ENGLISH — BEGINNER (full lesson content, incl. real example dialogue)
-- ============================================================

UPDATE curriculum_topics SET content =
'WHAT: Introducing yourself is saying your name, what you do, and a little background — the first thing that happens in any interview or new conversation.

WHY IT MATTERS: First impressions are fast. An interviewer decides a lot about your confidence and clarity in the first 20 seconds. If your introduction is smooth, everything after it feels easier for both of you.

WHERE IT''S USED: The opening of every interview ("Tell me about yourself"), meeting new colleagues, networking events, the start of any English conversation with a stranger.

HOW TO DO IT — a simple, reliable pattern:
1. Greeting + name: "Hi, I''m Michael."
2. What you do: "I''m a software developer" / "I''m currently studying computer science."
3. One relevant detail: "I''ve been focused on web development for about a year."
4. Optional forward hook: "I''m excited to talk about the role today."

EXAMPLE DIALOGUE:
Interviewer: "Hi, thanks for joining. Can you start by telling me about yourself?"
You: "Hi, I''m Michael. I''m a software developer based in Dar es Salaam. Over the past year I''ve been focused on building web applications, and I''m really excited about this opportunity because it lines up with where I want to grow next."

COMMON MISTAKE: Giving your entire life story. Keep it to 3-4 sentences — this is a preview, not the whole interview.'
WHERE slug = 'en-b1';

UPDATE curriculum_topics SET content =
'WHAT: Simple present tense describes things that are generally true or happen regularly — your job, your daily habits, ongoing responsibilities.

WHY IT MATTERS: Almost every answer about "what you do" uses this tense. Getting it wrong (e.g. "I working" instead of "I work") is one of the most common English mistakes, and it makes otherwise strong answers sound less polished.

WHERE IT''S USED: Describing your current job or studies, daily routines, technical explanations ("this function returns...", "the system handles...").

THE RULE: subject + base verb (+s for he/she/it).
"I work" / "She works" / "The team reviews code every Friday."

EXAMPLE:
"I work as a frontend developer. Every morning, I check my tasks, then I collaborate with the backend team on API integration. I usually review pull requests before lunch."

COMMON MISTAKE: Forgetting the "s" on third person ("he work" instead of "he works"), or using continuous tense ("I am working as a developer") when the simple present is more natural for describing a general role.'
WHERE slug = 'en-b2';

UPDATE curriculum_topics SET content =
'WHAT: A working vocabulary of the words interviewers use constantly: responsibility, experience, achievement, skill, contribute, collaborate, challenge, deadline.

WHY IT MATTERS: You can know the grammar perfectly and still sound unprepared if you''re missing the specific words interviewers expect. These words signal professionalism.

KEY WORDS AND HOW THEY''RE USED:
- Responsibility: "My main responsibility was managing the deployment pipeline."
- Experience: "I have two years of experience with React."
- Achievement: "One achievement I''m proud of is reducing load time by 30%."
- Contribute: "I contributed to three major product launches."
- Collaborate: "I collaborated closely with the design team."
- Challenge: "The biggest challenge was handling inconsistent data."
- Deadline: "We delivered the feature ahead of the deadline."

WHERE IT''S USED: Almost every interview answer benefits from at least one of these — they turn a vague statement into a specific, credible one.'
WHERE slug = 'en-b3';

UPDATE curriculum_topics SET content =
'WHAT: A small set of polite phrases to ask an interviewer to repeat or explain something — without it sounding like you weren''t listening.

WHY IT MATTERS: Everyone mishears a question sometimes, especially over a call or in a second language. Asking for clarification the right way actually makes you look more confident, not less — silence or guessing wrong looks worse.

USEFUL PHRASES:
- "Sorry, could you repeat that?"
- "Could you clarify what you mean by...?"
- "Just to confirm, are you asking about...?"
- "Sorry, I didn''t quite catch that — could you say it again?"

WHERE IT''S USED: Any interview, any conversation with unclear audio, technical questions with ambiguous wording.

TIP: Say it calmly and immediately — don''t guess and give an unrelated answer, which is far more noticeable than a polite clarifying question.'
WHERE slug = 'en-b4';

UPDATE curriculum_topics SET content =
'WHAT: Correctly saying years, dates, and durations — "I have three years of experience," "since 2021," "for about six months."

WHY IT MATTERS: Interviews are full of these numbers, and getting them wrong or hesitating over them undermines an otherwise strong answer.

KEY PATTERNS:
- Duration: "for" + length of time → "I''ve worked there for two years."
- Starting point: "since" + a specific point → "I''ve worked there since 2022."
- Years: say each digit or pair naturally → "2024" = "twenty twenty-four."
- Approximate: "about," "around," "roughly" → "around six months."

EXAMPLE:
"I''ve been coding for about three years, and I''ve worked at my current company since January 2023."

COMMON MISTAKE: Mixing up "for" and "since" — "since two years" is wrong; it should be "for two years" or "since 2022."'
WHERE slug = 'en-b5';

UPDATE curriculum_topics SET content =
'WHAT: Simple past tense describes finished actions — what you did in a past job, project, or specific situation.

WHY IT MATTERS: Behavioral questions ("Tell me about a time when...") almost always require past tense. Mixing up tenses here is one of the fastest ways to sound less fluent than you actually are.

THE RULE: regular verbs add "-ed" (worked, built, tested); irregular verbs change form (went, built, wrote, did).

EXAMPLE:
"Last year, I built a scheduling tool for my team. I designed the database, wrote the backend logic, and tested it with real users before we launched it."

COMMON MISTAKE: Switching mid-story into present tense ("I built the tool and then I test it") — pick past tense and stay in it for the whole story.'
WHERE slug = 'en-b6';

UPDATE curriculum_topics SET content =
'WHAT: STAR stands for Situation, Task, Action, Result — a simple structure for answering "tell me about a time when..." questions.

WHY IT MATTERS: Without structure, answers to behavioral questions ramble and the interviewer loses the point. STAR keeps you organized even under pressure.

THE STRUCTURE:
- Situation: set the scene in 1-2 sentences. "On my last project, we were behind schedule."
- Task: what were you responsible for? "I needed to speed up our testing process."
- Action: what did you actually do? "I automated our test suite using Jest."
- Result: what happened? "We cut testing time by 40% and hit our deadline."

WHERE IT''S USED: Behavioral interviews, but also useful any time someone asks you to describe an experience.

TIP: Even a short STAR answer (4 sentences) beats a long answer with no structure.'
WHERE slug = 'en-b7';

UPDATE curriculum_topics SET content =
'WHAT: Filler words are the "um," "uh," "like," "you know" that creep into speech, especially when thinking under pressure.

WHY IT MATTERS: A few filler words are completely normal and human. Too many make you sound less confident and can distract the listener from your actual answer.

HOW TO REDUCE THEM:
1. Pause silently instead of filling the gap with "um" — silence feels longer to you than it does to the listener.
2. Slow down slightly; rushing increases filler words.
3. If you lose your train of thought, it''s fine to say "Let me think about that for a second" instead of "um... um...".

WHERE IT''S USED: Every spoken interaction — this is a habit you build through practice, not a rule you apply once.

TIP: Recording yourself and listening back is the fastest way to notice your own patterns.'
WHERE slug = 'en-b8';

-- ============================================================
-- ENGLISH — INTERMEDIATE (concise but real content)
-- ============================================================

UPDATE curriculum_topics SET content =
'WHAT: Backing up an accomplishment with a specific, believable number instead of a vague claim.

WHY IT MATTERS: "I improved performance" is forgettable. "I reduced page load time from 4s to 1.2s" is memorable and credible — even an estimated number is far stronger than none.

PATTERN: [action] + [specific metric] + [context/timeframe].
"I redesigned the checkout flow, which reduced cart abandonment by about 15% over two months."

TIP: If you don''t have an exact number, use a reasonable estimate and say so: "roughly 20%" is fine and honest.'
WHERE slug = 'en-i1';

UPDATE curriculum_topics SET content =
'WHAT: Comparative language lets you describe growth and strengths relative to before — "more confident than I was," "faster than our previous approach."

WHY IT MATTERS: Interviewers often ask about growth or strengths — comparative language shows self-awareness and progress, not just a static skill list.

PATTERNS: "more/less + adjective + than", "-er + than" for short adjectives.
"I''m much more comfortable with system design now than I was a year ago."
"This approach was simpler than our old one."

WHERE IT''S USED: Answering "what''s your greatest strength," describing growth over time.'
WHERE slug = 'en-i2';

UPDATE curriculum_topics SET content =
'WHAT: Staying composed and coherent when an interviewer digs deeper into something you just said — "Why did you choose that?" "What would you do differently?"

WHY IT MATTERS: Follow-ups test whether your first answer was genuine or memorized. Handling them well is often more impressive than the original answer.

APPROACH: Pause briefly if needed, acknowledge the question directly, then answer specifically — don''t repeat your first answer, add new detail.

EXAMPLE:
Q: "Why did you choose that database?"
A: "Good question — we needed strong support for relational data and the team already had PostgreSQL experience, so it minimized ramp-up time while meeting our query needs."'
WHERE slug = 'en-i3';

UPDATE curriculum_topics SET content =
'WHAT: Describing a disagreement, conflict, or setback professionally — without blaming people or sounding bitter.

WHY IT MATTERS: "Tell me about a conflict" is one of the most common behavioral questions. How you talk about it reveals maturity and self-awareness.

APPROACH: Describe the situation factually, focus on your own actions and reasoning, end with what you learned or how it was resolved — avoid naming/blaming specific people negatively.

EXAMPLE:
"My teammate and I disagreed on the architecture for a feature. Instead of pushing my view, I proposed we prototype both approaches quickly and compare. That resolved it objectively, and we both learned from the comparison."'
WHERE slug = 'en-i4';

UPDATE curriculum_topics SET content =
'WHAT: Explaining a technical concept in plain language for a non-technical listener — no jargon, using analogies where useful.

WHY IT MATTERS: Some interviewers (recruiters, cross-functional stakeholders) aren''t technical. Being able to adjust your explanation shows communication skill, which is as important as the technical skill itself.

APPROACH: Replace jargon with everyday words, use a short analogy, focus on impact rather than implementation detail.

EXAMPLE:
Technical: "I implemented caching with Redis to reduce database load."
Plain: "I added a way for the app to remember recently-used information instead of looking it up every time — like keeping your most-used tools on your desk instead of in a drawer. That made the app noticeably faster."'
WHERE slug = 'en-i5';

UPDATE curriculum_topics SET content =
'WHAT: Discussing salary expectations and compensation confidently and professionally, without over- or under-selling yourself.

WHY IT MATTERS: This conversation makes many candidates uncomfortable, which can come across as weak positioning even when the underlying request is reasonable.

USEFUL PHRASES:
- "Based on my research and experience, I''m looking for a range around X."
- "I''m open to discussing the full package, not just base salary."
- "Could you share the budgeted range for this role first?"

TIP: A confident, neutral tone matters more than the specific number — practice saying your number without hesitation.'
WHERE slug = 'en-i6';

UPDATE curriculum_topics SET content =
'WHAT: Delivering a complete STAR answer smoothly, without long pauses or restarting the story halfway through.

WHY IT MATTERS: By this stage you know the STAR structure — fluency means you can execute it live, under time pressure, without sounding rehearsed-but-shaky.

APPROACH: Prepare 3-4 strong stories in advance (not memorized word-for-word, just the key facts), practice saying them out loud, aim for 60-90 seconds per story.

TIP: If you stumble, it''s fine to say "let me back up" and re-state a sentence — that''s more natural than freezing.'
WHERE slug = 'en-i7';

UPDATE curriculum_topics SET content =
'WHAT: Keeping a steady, natural speaking pace even when nervous, rather than rushing through answers.

WHY IT MATTERS: Nerves speed people up, which increases filler words and mistakes, and makes answers harder to follow.

TECHNIQUE: Consciously slow your first sentence — the rest tends to follow that pace. Pause briefly between sentences instead of running them together.

WHERE IT''S USED: Every spoken interaction — this is a physical habit built through repeated practice, most effectively in a live, timed setting like a mock interview.'
WHERE slug = 'en-i8';

-- ============================================================
-- ENGLISH — ADVANCED (concise but real content)
-- ============================================================

UPDATE curriculum_topics SET content =
'WHAT: Framing your work the way a senior leader would — leading with outcomes and ownership, not just a list of tasks.

WHY IT MATTERS: At senior levels, interviewers care less about "what you did" and more about "what changed because of you" and "what you decided."

PATTERN: Outcome first, then the decision/ownership that drove it, then brief supporting detail.
"We cut incident response time by half. I made the call to restructure our on-call rotation and introduced automated alerting — that ownership decision was the turning point."'
WHERE slug = 'en-a1';

UPDATE curriculum_topics SET content =
'WHAT: Structuring an answer as a compelling narrative — tension, decision, resolution — rather than a flat list of facts.

WHY IT MATTERS: Senior interviews are often as much about how you communicate as what you did. A story is remembered; a list of bullet points is not.

STRUCTURE: Set up a real stake or tension → describe the pivotal decision → show the resolution and what it revealed about you.'
WHERE slug = 'en-a2';

UPDATE curriculum_topics SET content =
'WHAT: Staying composed and thinking out loud clearly on a question you genuinely didn''t prepare for.

WHY IT MATTERS: Curveball questions test adaptability, not memorized answers — interviewers often want to see your reasoning process more than a "correct" answer.

APPROACH: It''s fine to pause and say "let me think through this out loud." Narrate your reasoning step by step rather than staying silent then giving a final answer with no visible process.'
WHERE slug = 'en-a3';

UPDATE curriculum_topics SET content =
'WHAT: Adjusting tone, directness, and formality appropriately for different interviewer styles and cultural contexts.

WHY IT MATTERS: What reads as "confident" in one context can read as "blunt" in another. Senior candidates read the room and adapt.

TIP: Mirror the interviewer''s energy and formality level in the first few exchanges, then calibrate from there.'
WHERE slug = 'en-a4';

UPDATE curriculum_topics SET content =
'WHAT: Going deep on a technical topic with precise, advanced vocabulary — trade-offs, edge cases, failure modes — for a technical audience.

WHY IT MATTERS: At senior/staff level, interviewers expect nuance: not just "what" but "under what conditions would this break," "what did you trade off."

TIP: Proactively mention trade-offs and alternatives you considered — it signals depth beyond just recalling a solution.'
WHERE slug = 'en-a5';

UPDATE curriculum_topics SET content =
'WHAT: Telling a credible leadership or mentorship story with real nuance — including a moment of difficulty, not just success.

WHY IT MATTERS: A story with zero friction sounds rehearsed or dishonest. A believable leadership story includes a real challenge and how you navigated it.'
WHERE slug = 'en-a6';

UPDATE curriculum_topics SET content =
'WHAT: Compressing a complex answer into a tight, high-signal summary when time is short — "give me the 30-second version."

WHY IT MATTERS: Senior roles require communicating to executives who want the headline first, detail only if asked.

TECHNIQUE: Lead with the conclusion/outcome in one sentence, then offer "I can go deeper on any part of that" rather than front-loading detail.'
WHERE slug = 'en-a7';

UPDATE curriculum_topics SET content =
'WHAT: Using natural idioms and phrasing that sound native rather than textbook-correct-but-stiff.

WHY IT MATTERS: This is the last layer of polish — technically correct English that still sounds slightly formal or translated. Idiomatic phrasing makes you sound completely natural.

EXAMPLES: "hit the ground running," "back to the drawing board," "a steep learning curve," "low-hanging fruit" — used naturally, not forced into every sentence.'
WHERE slug = 'en-a8';

-- ============================================================
-- TECH VOCABULARY — a dedicated topic added to English intermediate
-- ============================================================

INSERT INTO curriculum_topics (track, level, order_index, slug, title, description, content) VALUES
('english', 'intermediate', 9, 'en-i9', 'Talking about technology',
 'Vocabulary and phrasing for discussing computers, software, and technical work clearly in English.',
 'WHAT: A working vocabulary for talking about technology in general terms — hardware, software, the internet, how systems work — beyond just your own project.

WHY IT MATTERS: Interviews and technical conversations often need you to explain general tech concepts, not just your specific code. Comfort with this vocabulary makes you sound fluent in the field, not just in your narrow task.

KEY VOCABULARY AND EXAMPLE USAGE:
- Server / client: "The client sends a request, and the server processes it and sends back a response."
- API: "The API lets two systems talk to each other using a defined set of rules."
- Database: "The database stores and organizes the data so the app can retrieve it quickly."
- Bug / debug: "I found a bug in the login flow and spent an hour debugging it."
- Deploy / deployment: "We deploy new code to production every Friday."
- Scale / scalability: "The system needs to scale to handle ten times more users."
- Latency: "High latency made the app feel slow, even though it wasn''t crashing."
- Framework / library: "React is a library for building user interfaces; Next.js is a framework built on top of it."
- Version control: "We use Git for version control so we can track every change to the code."
- Cloud: "We host our infrastructure in the cloud instead of on physical servers."

PRACTICE PROMPT: Try explaining what your favorite app does technically, in plain English, using five of these words naturally.'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CODING topics — what/why/where content (talked through verbally now,
-- since there is no code editor — this is what the AI teaches before a
-- verbal problem-solving conversation on the topic).
-- ============================================================

UPDATE curriculum_topics SET content = 'WHAT: Arrays store an ordered list of items you can access instantly by position (index).
WHY IT MATTERS: They''re the foundation almost every other data structure builds on, and "array problems" are the most common opening question in technical interviews.
WHERE USED: Storing lists of anything — scores, names, transactions — whenever order and fast lookup-by-position matter.
KEY IDEA TO BE READY TO DISCUSS: accessing by index is instant (O(1)), but searching for a value or inserting in the middle is slower (O(n)) because other elements may need to shift.' WHERE slug = 'cd-b1';

UPDATE curriculum_topics SET content = 'WHAT: Strings are sequences of characters — text — and string problems are about searching, comparing, or rearranging that text.
WHY IT MATTERS: Nearly every real application processes text somewhere (usernames, search, validation), and string problems test careful, precise thinking.
WHERE USED: Parsing input, validating formats (like emails), searching for patterns, formatting output.
KEY IDEA: strings are usually treated as immutable in many languages — "changing" a string often means building a new one.' WHERE slug = 'cd-b2';

UPDATE curriculum_topics SET content = 'WHAT: A hash table maps a key to a value so you can look values up almost instantly, without scanning a whole list.
WHY IT MATTERS: It''s the single most useful trick for turning a slow (O(n²)) solution into a fast one — recognizing "I need fast lookups" is a core interview skill.
WHERE USED: Counting occurrences, checking for duplicates, caching, grouping data by a key.
KEY IDEA: trade memory for speed — you store extra data so you can look things up in roughly constant time.' WHERE slug = 'cd-b3';

UPDATE curriculum_topics SET content = 'WHAT: Two pointers means tracking two positions in a list at once and moving them based on a rule, instead of comparing every pair.
WHY IT MATTERS: It turns many O(n²) brute-force problems into O(n) — a classic efficiency upgrade interviewers look for.
WHERE USED: Finding pairs that sum to a target in a sorted list, reversing in place, removing duplicates.
KEY IDEA: usually requires sorted (or otherwise structured) data so moving a pointer has a predictable effect.' WHERE slug = 'cd-b4';

UPDATE curriculum_topics SET content = 'WHAT: A sliding window is a two-pointer variant where you track a continuous "window" of elements and grow/shrink it as you scan.
WHY IT MATTERS: It efficiently solves "longest/shortest substring or subarray matching a condition" problems, a very common interview category.
WHERE USED: Longest substring without repeats, maximum sum subarray of fixed size, minimum window containing certain characters.
KEY IDEA: expand the window to include more elements, shrink it when a condition is violated — each element is visited a small, bounded number of times.' WHERE slug = 'cd-i1';

UPDATE curriculum_topics SET content = 'WHAT: A linked list is a chain of nodes, each pointing to the next, instead of items sitting in one continuous block of memory like an array.
WHY IT MATTERS: Understanding pointers/references deeply is core to reasoning about most real data structures, and linked list problems test that directly.
WHERE USED: Anywhere insertion/removal needs to be fast without shifting everything (e.g. undo history, music playlists).
KEY IDEA: no fast access by index (must walk from the start), but insertion/removal at a known position is fast.' WHERE slug = 'cd-i2';

UPDATE curriculum_topics SET content = 'WHAT: Binary search repeatedly cuts a sorted list in half to find a target in O(log n) instead of scanning one by one.
WHY IT MATTERS: It''s the classic example of "the data being sorted changes what''s possible" — recognizing when it applies is a key interview signal.
WHERE USED: Searching sorted data, and more advanced "search the answer space" problems (e.g. find the smallest value that satisfies a condition).
KEY IDEA: at each step, you eliminate half the remaining possibilities — that''s what makes it so fast.' WHERE slug = 'cd-i3';

UPDATE curriculum_topics SET content = 'WHAT: Recursion is a function that solves a problem by calling itself on a smaller version of the same problem, until it hits a simple base case.
WHY IT MATTERS: It''s the natural way to think about trees, graphs, and "divide and conquer" problems — hard to avoid at intermediate level and beyond.
WHERE USED: Tree traversal, generating combinations, any problem that breaks cleanly into smaller identical subproblems.
KEY IDEA: always identify the base case (when to stop) and the recursive case (how the smaller problem relates to the bigger one) explicitly.' WHERE slug = 'cd-i4';

UPDATE curriculum_topics SET content = 'WHAT: A tree is a hierarchical structure of nodes with parent-child relationships and no cycles — like a family tree or a file system.
WHY IT MATTERS: Trees model an enormous number of real systems (file systems, org charts, decision logic), and traversal patterns here reappear everywhere in software.
WHERE USED: File systems, UI component hierarchies, decision trees, database indexes.
KEY IDEA: know the difference between depth-first (go deep before wide) and breadth-first (go wide, level by level) traversal, and when each is appropriate.' WHERE slug = 'cd-a1';

UPDATE curriculum_topics SET content = 'WHAT: A graph is nodes connected by edges, without the strict hierarchy of a tree — connections can go anywhere, including cycles.
WHY IT MATTERS: Graphs model relationships and networks — one of the richest, most commonly asked advanced topics.
WHERE USED: Social networks, maps/routing, dependency resolution (e.g. build systems), recommendation systems.
KEY IDEA: BFS finds the shortest path in an unweighted graph; DFS is often simpler for exploring/detecting cycles.' WHERE slug = 'cd-a2';

UPDATE curriculum_topics SET content = 'WHAT: Dynamic programming solves a problem by breaking it into overlapping subproblems and storing (memoizing) their results instead of recomputing them.
WHY IT MATTERS: It''s widely considered the hardest common interview topic, because it requires spotting a non-obvious structure in the problem.
WHERE USED: Optimization problems ("what''s the minimum/maximum way to..."), counting problems with overlapping cases.
KEY IDEA: two signs a problem might be DP: it asks for an optimum (min/max/count), and a brute-force recursive solution would recompute the same subproblem many times.' WHERE slug = 'cd-a3';

UPDATE curriculum_topics SET content = 'WHAT: Bit manipulation works directly on the binary (0/1) representation of numbers using operations like AND, OR, XOR, and shifts.
WHY IT MATTERS: It''s a narrower topic, but a small set of classic tricks (especially XOR) solve certain problems in a way that looks almost like magic if you don''t know them.
WHERE USED: Memory-efficient flags/sets, certain optimization problems, low-level systems programming.
KEY IDEA: XOR of a number with itself is 0, and XOR of a number with 0 is itself — this single fact solves a surprising number of "find the unique/missing element" problems.' WHERE slug = 'cd-a4';

-- ============================================================
-- INTERVIEW READINESS topics — what/why/where content
-- ============================================================

UPDATE curriculum_topics SET content = 'WHAT: The first-round recruiter call — usually not technical, focused on background, motivation, and logistics (salary range, availability, work authorization).
WHY IT MATTERS: This round filters out mismatches before anyone invests time in technical rounds — treat it as seriously as a technical interview, not a formality.
WHAT TO PREPARE: a tight "tell me about yourself," a clear reason you want THIS role/company (not generic), and honest, confident answers about logistics.' WHERE slug = 'iv-b1';

UPDATE curriculum_topics SET content = 'WHAT: Behavioral questions ask about past experiences to predict future behavior — "tell me about a time when you faced a challenge."
WHY IT MATTERS: Nearly every interview process includes at least one behavioral round, and unstructured answers here are one of the most common rejection reasons.
WHAT TO PREPARE: 3-4 solid stories from your real experience, loosely structured with STAR (Situation, Task, Action, Result) — see the matching English topic for the full structure.' WHERE slug = 'iv-b2';

UPDATE curriculum_topics SET content = 'WHAT: Explaining code or a project you already built — walking someone through your own past decisions clearly and calmly.
WHY IT MATTERS: You will very often be asked to explain something from your resume or portfolio — being unable to explain your own past work clearly is a red flag to interviewers.
WHAT TO PREPARE: for 2-3 of your best projects, be ready to explain what it does, one hard technical decision you made, and why.' WHERE slug = 'iv-b3';

UPDATE curriculum_topics SET content = 'WHAT: The practical logistics of an interview — arriving/joining on time, how to ask good follow-up questions, how to close the conversation.
WHY IT MATTERS: Strong answers can be undercut by weak etiquette (rambling, no questions for the interviewer, unclear next steps).
WHAT TO PREPARE: 2-3 genuine questions to ask the interviewer, and a short, confident closing line ("Thank you for your time — I''m looking forward to hearing next steps").' WHERE slug = 'iv-b4';

UPDATE curriculum_topics SET content = 'WHAT: A full technical round — solving and explaining a live problem end-to-end, thinking out loud the whole time, under time pressure.
WHY IT MATTERS: This is where "think-aloud" skill matters as much as raw problem-solving — interviewers are evaluating your process, not just your final answer.
WHAT TO PREPARE: practice narrating your thinking as you work through a problem verbally, not solving in silence and announcing only the final answer.' WHERE slug = 'iv-i1';

UPDATE curriculum_topics SET content = 'WHAT: Handling behavioral follow-up questions that dig deeper into your first answer — "what would you do differently?"
WHY IT MATTERS: Follow-ups reveal whether a story was genuine and reflected-upon, or just memorized — this is where interviewers separate similar-sounding answers.
WHAT TO PREPARE: for each of your prepared stories, think through likely follow-ups in advance: what went wrong, what you''d change, what others thought.' WHERE slug = 'iv-i2';

UPDATE curriculum_topics SET content = 'WHAT: Justifying technical decisions and discussing trade-offs out loud — "why did you choose X over Y?"
WHY IT MATTERS: At intermediate level and beyond, interviewers care less about the choice itself and more about whether you can reason about trade-offs.
WHAT TO PREPARE: for major decisions in your projects, know at least one alternative you considered and why you didn''t choose it.' WHERE slug = 'iv-i3';

UPDATE curriculum_topics SET content = 'WHAT: Adapting your interview answers to a specific company''s stated values, product, and interview style.
WHY IT MATTERS: A generic answer is noticeably weaker than one that shows you researched the specific company — it signals genuine interest.
WHAT TO PREPARE: read the company''s engineering blog or values page, and prepare one specific, genuine connection between your experience and their work.' WHERE slug = 'iv-i4';

UPDATE curriculum_topics SET content = 'WHAT: System design interviews ask you to design a scalable system (e.g. "design Twitter'') from requirements to high-level architecture.
WHY IT MATTERS: This is standard for mid-level and above roles — it tests breadth of knowledge and structured thinking under ambiguity, not memorized diagrams.
WHAT TO PREPARE: a repeatable structure — clarify requirements, estimate scale, sketch high-level components, then go deeper on 1-2 areas the interviewer probes.' WHERE slug = 'iv-a1';

UPDATE curriculum_topics SET content = 'WHAT: Deep follow-ups on a system design — bottlenecks, scaling limits, failure modes, "what happens if this component goes down?"
WHY IT MATTERS: The first-pass design is rarely the point — how you respond when it''s pressure-tested is what separates strong candidates.
WHAT TO PREPARE: for any design, proactively think through "what breaks first as load increases" and "what''s the single point of failure."' WHERE slug = 'iv-a2';

UPDATE curriculum_topics SET content = 'WHAT: Senior-level behavioral questions about leading teams, mentoring, and resolving conflict at a higher level of ambiguity and stakes.
WHY IT MATTERS: At senior level, technical skill is often assumed — these questions are where the actual differentiation happens.
WHAT TO PREPARE: a real story involving leading through disagreement or ambiguity, including a genuine moment of difficulty, not just a clean success.' WHERE slug = 'iv-a3';

UPDATE curriculum_topics SET content = 'WHAT: A complete, realistic mock interview combining HR, behavioral, technical, and closing — start to finish, timed.
WHY IT MATTERS: Practicing pieces separately is useful, but stamina and consistency across a full 45-60 minute interview is its own skill.
WHAT TO PREPARE: nothing new — this is where everything from earlier topics comes together under realistic conditions.' WHERE slug = 'iv-a4';
