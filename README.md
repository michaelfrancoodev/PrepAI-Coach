# PrepAI — AI Interview, English & Coding Coach

PrepAI is a full-stack, AI-powered practice platform for job interview prep,
English fluency, and coding skills — built around a real-time voice AI
interviewer and a curriculum-based mastery/spaced-repetition engine, so
practice compounds into measurable, real skill instead of one-off sessions.

> **Status:** actively developed. Core systems below are implemented and
> pass lint/typecheck/build. See [Known limitations](#known-limitations)
> for what still needs real-device QA before a production launch.

---

## Table of contents

- [What this app actually does](#what-this-app-actually-does)
- [Core systems](#core-systems)
  - [1. Live Voice interviews](#1-live-voice-interviews)
  - [2. Timed, locked sessions](#2-timed-locked-sessions)
  - [3. The Mastery Engine](#3-the-mastery-engine)
  - [4. Level-adaptive AI](#4-level-adaptive-ai)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Database schema (high level)](#database-schema-high-level)
- [Gemini free-tier notes](#gemini-free-tier-notes)
- [Known limitations](#known-limitations)
- [Roadmap / explicitly out of scope](#roadmap--explicitly-out-of-scope)

---

## What this app actually does

A learner picks a track — **English**, **Coding**, or **Interviews** — and
the app tells them exactly one thing to do next, based on real curriculum
progress, not a random task generator. They practice by *talking* to an AI
interviewer in real time (not typing, not reading a script), get scored,
and the app schedules when that topic should come back for review using
spaced repetition — so skills that are shaky resurface before they're
forgotten, and skills that are solid get out of the way.

---

## Core systems

### 1. Live Voice interviews

Real speech-to-speech conversation via the **Gemini Live API** over a
direct browser WebSocket — not the older "record → transcribe → send text →
speak back" pipeline, which has multi-second dead air between turns.

- Native audio in and out, streamed continuously.
- The model's own voice-activity-detection decides when you've finished
  talking — there is no fixed silence timer guessing for you.
- **Barge-in**: interrupt the AI mid-sentence like a real conversation; it
  stops and listens.
- Live, word-by-word transcript that grows as you speak (not fragmented
  bubbles per audio chunk).
- The browser mic key never touches the client raw — `supabase/functions/live-token`
  mints a short-lived, single-use token server-side so the real
  `GEMINI_API_KEY` is never exposed to the page.

A parallel **classic Text mode** exists for anyone who'd rather type (or for
coding questions where pasting code matters). Its speech-to-text input
(`src/hooks/useSpeech.ts`) is fully manual: recording starts and stops only
when *you* press the mic button — there is no auto-stop-on-silence timer.

### 2. Timed, locked sessions

Before starting, you pick a duration (5, 10, 15, 30, 45 min, or 1 hour).
Once the voice connection is actually live, the countdown starts and the
"End" control is locked until time runs out — mirroring a real interview,
where you can't just bail after one hard question. A confirm-gated
"Exit early (emergency)" link stays available for genuine problems (bad
connection, real emergency), so nobody is ever truly trapped.

The clock deliberately does **not** start the instant you click "Start
Interview" — it waits for the Live Voice socket to report `connected`, so
mic-permission prompts or a slow network don't eat into your time.

### 3. The Mastery Engine

The part that turns "practiced a bit" into "actually getting better."

- **`curriculum_topics`** — a hand-authored, seeded map of what 0 → 100
  means in each track, broken into `beginner → intermediate → advanced`, in
  learning order (48 topics total: 24 English, 12 Coding, 12 Interview
  readiness — see the seed data in
  `supabase/migrations/20260725100000_mastery_engine.sql`).
- **`user_mastery`** — one row per (user, topic): a 0–100 score and a
  spaced-repetition schedule.
- **Scheduling algorithm**: a lightweight SM-2 variant
  (`src/hooks/useData.ts` → `useMastery`). A practice result (0–100) maps to
  a 0–5 "quality" grade; good grades push the next review further out
  (interval × ease factor), poor grades reset the interval to 1 day and
  shrink the ease factor so weak topics resurface sooner.
- **Level gating**: a track's `advanced` topics don't appear as "next to
  learn" until every `beginner` topic in that track is mastered (score
  ≥ 70), and so on for `intermediate → advanced`.
- **Runs entirely client-side, with zero extra Gemini calls** — spaced
  repetition is arithmetic, not AI, which matters a lot on a free API quota
  (see [Gemini free-tier notes](#gemini-free-tier-notes)).

This one data source drives the Dashboard hero button, the "Your Journey"
progress cards, and the "Today's Plan" task list — there is intentionally
no second, disconnected "AI-generated daily mission" system anymore; that
was removed because running two sources of "what to do today" made the app
feel inconsistent.

**Recording results:** finishing an Interview, a Coding submission, or an
English conversation all call `recordPractice(topicId, score)`, which
reschedules that topic. Coding maps 1:1 by problem category (`arrays`,
`trees`, etc.); Interviews map by interview mode; English conversation
applies its score to whichever English topic is currently active for that
user (a due review, or the next new topic).

### 4. Level-adaptive AI

Every prompt (chat, all interview types, Live Voice) receives the learner's
`experience_level` and is instructed to match vocabulary and depth to it —
simple language and one idea at a time for a beginner, straight to nuance
and edge cases for advanced/expert, never re-explaining basics a stated
level already knows. The AI also never invents a name for itself if asked
("I'm just your coach") and answers the exact question asked instead of
padding with a generic overview.

---

## Architecture

```
React (Vite)                 Supabase Edge Functions          Gemini API
-----------                  -----------------------          ----------
Classic chat  ── REST ─────▶ ai-coach/index.ts        ── REST ▶ generateContent
(text + TTS)                 (streaming + JSON modes)          streamGenerateContent

Live Voice    ── REST ─────▶ live-token/index.ts      ── REST ▶ authTokens
(mic+speaker)                (mints short-lived token,
     │                        never the raw API key)
     └──────────────── WebSocket, direct ─────────────────────▶ BidiGenerateContent
                                                                 (Live API)

Mastery Engine  ── Supabase Postgres (RLS) ── no AI calls, pure client logic
```

---

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · Supabase (Postgres, Auth, Edge
Functions, Row Level Security) · Google Gemini API (text + Live voice) ·
React Router · Recharts · lucide-react icons.

---

## Project structure

```
src/
  hooks/
    useGeminiLive.ts        WebSocket client for real-time voice (Live API)
    useSpeech.ts             Browser SpeechRecognition/TTS (classic text mode)
    useData.ts                All Supabase data hooks, incl. useMastery
  components/
    LiveVoicePanel.tsx        Live Voice UI (mic, live transcript, lock state)
    ChatPanel.tsx              Classic text chat UI
  pages/
    app/interviews/            Interview room, results, history
    app/coding/                 Category list, problem list, code editor
    app/english/                 Conversation, vocabulary, grammar, report
    app/learning/                 Roadmap / learning center
    app/coach/                     Freeform AI coach chat
    app/DashboardPage.tsx          Home: hero + Your Journey + Today's Plan
    onboarding/                     First-run setup wizard
    public/                          Marketing pages (landing, pricing, etc.)
  lib/
    types.ts                   Shared TypeScript types, incl. Mastery types
    supabase.ts                  Supabase client + exported URL helpers
supabase/
  functions/
    ai-coach/                   Main text/JSON AI endpoint (all prompts live here)
    live-token/                  Mints Gemini Live ephemeral tokens
  migrations/
    ...mastery_engine.sql        Curriculum schema + seed data
```

---

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run every file in `supabase/migrations/` in order (SQL editor or CLI) —
   this includes the Mastery Engine schema and its seeded curriculum.
3. Deploy the edge functions:
   ```bash
   supabase functions deploy ai-coach
   supabase functions deploy live-token
   ```
4. Set secrets (server-side only — never put these in the client `.env`):
   ```bash
   supabase secrets set GEMINI_API_KEY=your-real-gemini-key
   supabase secrets set GEMINI_MODEL=gemini-2.5-flash
   supabase secrets set GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
   ```
   Get a free key at <https://aistudio.google.com/apikey>.

### 2. Local environment

```bash
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase
project's API settings. Both are safe to expose in the browser bundle —
access control is enforced by Postgres Row Level Security, not by hiding
these values.

### 3. Install & run

```bash
npm install
npm run dev      # local dev server
npm run lint      # ESLint — should report 0 errors
npm run build      # production build via Vite
```

---

## Environment variables

See [`.env.example`](./.env.example) for the full, commented list. Summary:

| Variable | Where it's set | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client `.env` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | client `.env` | Public anon key (RLS-protected) |
| `GEMINI_API_KEY` | Supabase secret | Real Gemini key — server-side only |
| `GEMINI_MODEL` | Supabase secret | Text model (default `gemini-2.5-flash`) |
| `GEMINI_LIVE_MODEL` | Supabase secret | Live voice model |

---

## Database schema (high level)

- `profiles` — user settings, `experience_level`, goals, target companies.
- `practice_sessions` — every interview / coding / English session, with
  score, transcript, feedback.
- `roadmaps` — the AI-generated onboarding roadmap (phases, milestones).
- `curriculum_topics` — **shared, seeded** Mastery Engine content (see
  [The Mastery Engine](#3-the-mastery-engine)).
- `user_mastery` — **per-user** progress + spaced-repetition schedule
  against `curriculum_topics`.

All per-user tables are protected by Row Level Security policies scoped to
`auth.uid()`; `curriculum_topics` is readable by any authenticated user
(it's shared static content, not personal data).

---

## Gemini free-tier notes

This app is designed to work within Google's free Gemini API tier:

- **The Mastery Engine makes zero Gemini calls** for scheduling — spaced
  repetition is plain arithmetic (see [above](#3-the-mastery-engine)).
  Gemini is only called when a learner is actually practicing.
- Free-tier rate limits (RPM/RPD) change without notice on Google's side —
  check the current numbers for your project in
  [Google AI Studio](https://aistudio.google.com) rather than trusting any
  fixed number written here.
- **Enabling billing on your Supabase/Google project removes the free tier
  entirely for that project** — every call becomes billable from the first
  token, even ones that would've fit inside the free quota. Don't enable
  billing "just in case."
- Free-tier prompts/responses may be used by Google to improve their
  models — don't send private production user data through it if that's a
  concern; consider Vertex AI for that case instead.

---

## Known limitations

Read this before treating anything below as "done, ship it":

- **Live Voice audio capture** uses `ScriptProcessorNode`, which works
  broadly today but is a deprecated Web Audio API in favor of
  `AudioWorklet`. Fine for now; worth migrating before heavy production
  traffic.
- **No page has been manually QA'd on a real phone/tablet by a human yet.**
  A global responsive CSS safety net (`src/index.css`) prevents horizontal
  overflow and enforces finger-sized tap targets everywhere, and the
  Dashboard/Interview Room have had targeted responsive passes — but a full
  screen-by-screen visual QA pass across breakpoints is still outstanding.
- **English conversation practice** applies its score to "whichever English
  topic is currently active," not a topic chosen by matching the actual
  conversation subject — there's no clean 1:1 mapping for free-form
  conversation the way there is for coding problems (which map by
  category).
- **Gemini Live API pricing/limits differ from the text API** — verify
  current numbers before relying on this for many concurrent users.

---

## Roadmap / explicitly out of scope

To avoid endless feature creep, these are **deliberately not planned**:

- Resume/cover-letter builders, auto-apply, job boards — different product
  category, would dilute focus.
- A "stealth mode" / live-interview copilot that feeds answers during a
  *real* interview — this is cheating and won't be built, regardless of
  framing.
- Browser extensions or desktop apps — out of scope for the current focus
  (practice, not "assist during the real thing").
- Additional spoken languages beyond English/Swahili — depth over breadth
  for now.
