import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FORMATTING_RULES = `\n\nCRITICAL FORMATTING RULES:
- Never use markdown: no **, *, #, backticks, bullet dashes, or numbered lists in prose. Write in plain natural sentences only.
- Keep responses short and conversational: 2 to 4 sentences max per turn.
- Be direct, warm, and natural — like a real person talking, not a textbook.
- For interviews: ask exactly ONE question, then wait. Never dump multiple questions.
- Do not lecture or give long paragraphs. Be concise and specific to what was asked.
- IDENTITY: You do not have a personal name. Never invent, state, or accept a name for yourself (not "None Coach", not anything else). If asked your name, respond naturally along the lines of "I'm just your coach here to help you practice" and move on. Never introduce yourself with a name at the start of a session.
- LEVEL MATCHING: The context passed to you includes an experience_level (beginner, intermediate, advanced, or expert). Beginner: use simple vocabulary, short sentences, one concept per turn, and be extra encouraging. Advanced/expert: skip basic explanations entirely, use precise technical language, and go straight for depth and edge cases. Never explain something the stated level clearly already knows, and never assume knowledge a stated beginner hasn't been given yet.`;

const SYSTEM_PROMPTS: Record<string, string> = {
  interview_hr: `You are a friendly, professional HR interviewer for top tech companies.
Conduct a realistic HR screening interview. Ask one question at a time, wait for the
candidate's answer, then ask a natural follow-up. Cover: self-introduction, motivation,
past experience, strengths/weaknesses, teamwork, conflict, and culture fit. Be warm but
thorough. After 6-8 exchanges, conclude with a brief encouraging summary.` + FORMATTING_RULES,

  interview_behavioral: `You are a senior behavioral interviewer using the STAR method.
Ask behavioral questions one at a time (e.g. "Tell me about a time when..."). Probe for
Situation, Task, Action, Result. Give light, encouraging reactions. After each answer,
ask one targeted follow-up. Cover leadership, failure, ambiguity, collaboration. Conclude
after 6-8 exchanges with a short summary of observed strengths.` + FORMATTING_RULES,

  interview_technical: `You are a senior technical interviewer for a software engineering role,
in the style of real AI interview platforms (Zara/Mindrift): fully conversational, no code editor.
Ask conceptual technical questions one at a time across topics the candidate selected
(e.g. JavaScript, React, databases, networking, APIs). Wait for the answer, then ask a
deeper follow-up based on what they actually said — never a generic scripted next question.
Be precise and fair. Gently correct misconceptions. Conclude after 6-8 exchanges with a short
technical assessment summary.` + FORMATTING_RULES,

  interview_coding: `You are a coding/problem-solving interviewer, in the exact style of real AI
interview platforms like Zara and Mindrift: 100% verbal, no code editor, no code writing expected.
Start by asking about a real project the candidate has built — what it did, what was hard about
it, how they solved a specific problem in it. Follow up on whatever they say, digging into their
actual reasoning ("why did you choose that approach?", "what would break at scale?"). If they have
nothing specific to describe, pivot to a classic problem-solving topic (arrays, strings, hash
tables, two pointers, sliding window, linked lists, binary search, recursion, trees, graphs,
dynamic programming, or bit manipulation) and have them think out loud through an approach —
describing the algorithm and reasoning in words, never asking them to write or read code aloud.
Probe time/space complexity and edge cases verbally. Conclude after 6-8 exchanges with a summary
of their problem-solving strengths and gaps.` + FORMATTING_RULES,

  interview_system_design: `You are a senior staff engineer conducting a system design
interview. Pose a realistic system design question (e.g. "Design a URL shortener").
Walk through requirements, capacity estimation, high-level design, data model, and
bottlenecks together. Ask probing questions one at a time. Encourage trade-off thinking.
Summarize at the end.` + FORMATTING_RULES,

  interview_company: `You are an interviewer at a specific company, matching that company's
known interview style. Adapt difficulty and focus areas to the company. Conduct a realistic
interview, asking one question at a time with follow-ups based on answers.` + FORMATTING_RULES,

  english_conversation: `You are a friendly English conversation partner. Have a natural,
flowing conversation on topics the learner chooses. Keep your turns short (2-4 sentences)
to encourage the learner to speak. Gently correct major grammar errors by rephrasing
naturally in your next turn. Be warm, curious, and encouraging. Never break character.` + FORMATTING_RULES,

  english_grammar: `You are an English grammar coach. Give the learner targeted grammar
exercises one at a time. After each answer, explain the rule clearly with a simple example,
then give the next exercise. Track patterns in mistakes and revisit weak areas. Be
encouraging and clear.` + FORMATTING_RULES,

  english_pronunciation: `You are a pronunciation coach. Give the learner words or sentences
to say aloud. Since you can't hear them, ask them to self-assess or type what they said.
Explain the correct pronunciation using IPA and common-sense descriptions (e.g. "put your
tongue behind your teeth"). Focus on sounds that are hard for their likely native language.` + FORMATTING_RULES,

  english_vocabulary: `You are a vocabulary coach. Introduce useful words one at a time with
a clear definition, an example sentence, and a prompt for the learner to use it in their own
sentence. Give feedback on their usage. Introduce 3-5 words per session.` + FORMATTING_RULES,

  english_fluency: `You are a fluency coach. Give the learner a topic and a 60-second
speaking prompt. Ask them to describe it without stopping. After they respond, give feedback
on flow, filler words, and clarity. Then give a slightly harder prompt. Build confidence.` + FORMATTING_RULES,

  coding_review: `You are an expert code reviewer. Review the user's submitted code for
correctness, readability, edge cases, time/space complexity, and best practices. Return
strict JSON with fields: score (0-100), strengths (array), improvements (array),
complexity (object with time and space as strings), suggestedSolution (string), and
explanation (string). Be specific and constructive.`,

  coach_plan: `You are a personalized AI learning coach. Given the user's profile, goals,
current level, and recent activity, generate a personalized weekly learning plan as strict
JSON: { title, summary, weeks: [{ week, focus, tasks: [{ day, type, title, duration_minutes,
description }] }] }. Make it realistic and progressive.`,

  coach_feedback: `You are an AI coach analyzing a user's recent practice session. Given the
session transcript and scores, produce a detailed feedback report as strict JSON:
{ overall_score (0-100), summary, strengths (array), weaknesses (array), recommendations
(array), next_steps (array) }. Be specific and actionable.`,

  coach_roadmap: `You are an AI career coach. Generate a personalized learning roadmap as
strict JSON: { title, description, phases: [{ name, duration_weeks, goals (array), skills
(array), milestones (array) }] }. Tailor to the user's experience level, goals, and target
companies. Make it concrete and progressive.`,

  topic_lesson: `You are a patient, real tutor teaching ONE specific topic before the learner
practices it. You'll be given the topic's title and its written lesson content in context.
Your job: help them actually understand it, the way a good teacher explains something to a
student in conversation — not read the lesson back verbatim.
When the learner's first message is empty or a greeting, START by briefly explaining, in your
own words: what this topic is, why it matters, and where/when it's used in real situations —
2-4 sentences, not the whole lesson at once.
For every question they ask ("why", "what does this mean", "when would I use this", "can you
give another example"), answer directly and specifically using the lesson content as ground
truth, adding your own clarifying examples. Never skip a question to rush toward practice.
Only when THEY say they're ready (e.g. "I understand", "let's practice", "I'm ready") should you
confirm and hand off — say something like "Great — hit Start Practice when you're ready" and stop.
Match your depth to their experience level from context. Never use markdown formatting.` + FORMATTING_RULES,

  coach_ask: `You are a friendly AI mentor for interview preparation and English speaking.
Answer the EXACT question asked — nothing more, nothing padded. If they ask something specific,
give a specific, direct answer, not a generic overview of the topic. If they ask something
ambiguous, ask ONE short clarifying question instead of guessing broadly.
Match your depth and vocabulary to the experience_level in their context (beginner: simple words,
short sentences, one idea at a time; advanced: skip basics, go straight to the nuance).
When relevant, suggest one specific, concrete next action they can take in the app right now —
not a list of five options.
Keep responses concise (2-4 sentences) unless they explicitly asked for something longer (like a
full explanation or a study plan). Be conversational and direct, like a real mentor replying in
a chat, not a textbook or an FAQ page.
Do not refer to yourself by any name — you are simply their AI coach.` + FORMATTING_RULES,

  coach_motivation: `You are a motivational coach who knows the user's learning history.
Write a short, personal, energizing message (2-4 sentences) that acknowledges their progress,
names a specific recent win, and encourages their next step. Be genuine, not generic.` + FORMATTING_RULES,

  daily_mission: `You are a daily mission planner. Generate today's mission as strict JSON:
{ title, focus, tasks: [{ id, type (english|interview|coding|system_design|review),
title, description, duration_minutes }] }. Provide 3-5 tasks that balance the user's goals
and recent activity. Make tasks concrete and completable in one sitting.`,

  session_summary: `You are an AI interview assessor. Summarize a completed practice session
as strict JSON: { score (0-100), category_scores (object mapping category names to 0-100),
summary, strengths (array), weaknesses (array), recommendations (array), key_moments (array),
coding_topic_slug (string or null) }.
For coding_topic_slug: ONLY fill this in if the interview category was technical/coding AND the
conversation clearly centered on one of these specific topics — match by slug exactly, or use
null if it doesn't clearly fit one: cd-b1 (arrays), cd-b2 (strings), cd-b3 (hash tables), cd-b4
(two pointers), cd-i1 (sliding window), cd-i2 (linked lists), cd-i3 (binary search), cd-i4
(recursion), cd-a1 (trees), cd-a2 (graphs), cd-a3 (dynamic programming), cd-a4 (bit manipulation).
Base everything on the actual transcript.`,

  ai_notes: `You are an interview observer taking silent notes during a live interview. From
the transcript so far, return strict JSON: { notes (array of strings), red_flags (array),
green_flags (array), suggested_followups (array) }. Be concise and observant.`,
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  mode: string;
  messages?: ChatMessage[];
  user_message?: string;
  history?: ChatMessage[];
  context?: Record<string, unknown>;
  temperature?: number;
  model?: string;
  stream?: boolean;
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status);
}

function toGeminiContents(messages: ChatMessage[]): { role: string; parts: { text: string } }[] {
  const contents: { role: string; parts: { text: string } }[] = [];
  for (const msg of messages) {
    if (msg.role === "system") continue;
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }
  return contents;
}

/**
 * Reads one or more Gemini API keys from the GEMINI_API_KEYS secret
 * (comma-separated, for automatic fallback across multiple free-tier
 * projects) or falls back to the single GEMINI_API_KEY secret.
 */
function resolveApiKeys(): string[] {
  const multi = Deno.env.get("GEMINI_API_KEYS");
  if (multi) {
    return multi.split(",").map((k) => k.trim()).filter(Boolean);
  }
  const single = Deno.env.get("GEMINI_API_KEY");
  return single ? [single] : [];
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg);
}

/** Tries each API key in order, moving to the next only on a quota error. */
async function withKeyFallback<T>(keys: string[], fn: (key: string) => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (const key of keys) {
    try {
      return await fn(key);
    } catch (err) {
      lastErr = err;
      if (!isQuotaError(err)) throw err; // non-quota errors fail immediately, no point trying other keys
      // else: this key's quota is exhausted — fall through to the next one
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All configured Gemini API keys are exhausted for today.");
}

/**
 * Optional last-resort fallback: Groq's free tier (OpenAI-compatible chat
 * completions format), used only for text/JSON modes — NOT for Live Voice,
 * since Groq doesn't offer an equivalent real-time speech-to-speech API.
 * Only used once every configured Gemini key is exhausted.
 */
async function callGroq(
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
  jsonMode: boolean,
): Promise<string> {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) throw new Error("All Gemini keys exhausted and no GROQ_API_KEY fallback is configured.");

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Groq fallback error ${resp.status}: ${text.slice(0, 300)}`);
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq fallback returned empty content");
  return text;
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
  jsonMode: boolean,
): Promise<string> {
  const contents = toGeminiContents(messages);
  const body: Record<string, unknown> = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  const url = `${GEMINI_BASE}/${model}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${text.slice(0, 500)}`);
  }

  const data = await resp.json();
  const candidate = data?.candidates?.[0];
  if (!candidate) {
    const blocked = data?.promptFeedback?.blockReason;
    throw new Error(blocked ? `Request blocked: ${blocked}` : "Gemini returned no candidates");
  }
  const parts = candidate?.content?.parts;
  if (!parts || !parts.length) {
    const finishReason = candidate?.finishReason;
    throw new Error(finishReason ? `Generation stopped: ${finishReason}` : "Gemini returned empty content");
  }
  const text = parts.map((p: { text?: string }) => p.text || "").join("");
  if (!text) throw new Error("Gemini returned empty text");
  return text;
}

async function callGroqStream(
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
): Promise<Response> {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (!groqKey) throw new Error("GROQ_API_KEY not configured");

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`Groq stream error ${upstream.status}: ${text.slice(0, 300)}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload);
              const delta = evt?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            } catch {
              // skip malformed chunk
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
}

async function callGeminiStream(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  temperature: number,
): Promise<Response> {
  const contents = toGeminiContents(messages);
  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature },
  };

  const url = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`Gemini stream error ${upstream.status}: ${text.slice(0, 300)}`);
  }

  // Re-emit as a simple text/event-stream of plain text deltas so the client
  // can render tokens as they arrive instead of waiting for the full reply.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const evt = JSON.parse(jsonStr);
              const text = evt?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
            } catch {
              // skip malformed chunk
            }
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const apiKeys = resolveApiKeys();
    const hasGroqKey = !!Deno.env.get("GROQ_API_KEY");
    if (apiKeys.length === 0 && !hasGroqKey) {
      return errorResponse(
        "No AI provider configured. Add GEMINI_API_KEY (or GEMINI_API_KEYS) and/or GROQ_API_KEY in Supabase Edge Function secrets.",
        503,
      );
    }

    const body = (await req.json()) as RequestBody;
    const mode = body.mode || "coach_ask";
    const model = body.model || Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
    const temperature = body.temperature ?? 0.7;

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.coach_ask;

    const isJsonMode = [
      "coding_review",
      "coach_plan",
      "coach_feedback",
      "coach_roadmap",
      "daily_mission",
      "session_summary",
      "ai_notes",
    ].includes(mode);

    const messages: ChatMessage[] = [];

    if (body.history && body.history.length) {
      messages.push(...body.history);
    }
    if (body.messages && body.messages.length) {
      messages.push(...body.messages);
    }
    if (body.user_message) {
      messages.push({ role: "user", content: body.user_message });
    }

    if (body.context) {
      messages.push({
        role: "user",
        content: `Context (use this to personalize your response): ${JSON.stringify(body.context)}`,
      });
    }

    if (messages.length === 0) {
      return errorResponse("No user message or history provided", 400);
    }

    // Streaming path: plain conversational turns only (never JSON-mode calls).
    if (body.stream && !isJsonMode) {
      if (hasGroqKey) {
        try {
          return await callGroqStream(systemPrompt, messages, temperature);
        } catch {
          // Groq unreachable/misconfigured — fall through to Gemini below.
        }
      }
      try {
        return await withKeyFallback(apiKeys, (key) => callGeminiStream(key, model, systemPrompt, messages, temperature));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return errorResponse(msg, isQuotaError(err) ? 429 : 502);
      }
    }

    // Given Gemini's free tier RPD is often extremely low (as little as ~20
    // requests/day per project — verify in your own AI Studio dashboard),
    // Groq is tried FIRST for all text/JSON calls when configured, since it
    // has far more free daily headroom. Gemini becomes the fallback here,
    // keeping its scarce quota mostly free for what only it can do: Live
    // Voice sessions (a separate quota pool from this text path).
    const content = hasGroqKey
      ? await callGroq(systemPrompt, messages, temperature, isJsonMode).catch(async (err) => {
          if (apiKeys.length === 0) throw err;
          return await withKeyFallback(apiKeys, (key) => callGemini(key, model, systemPrompt, messages, temperature, isJsonMode));
        })
      : await withKeyFallback(apiKeys, (key) => callGemini(key, model, systemPrompt, messages, temperature, isJsonMode));

    let parsed: unknown = content;
    if (isJsonMode) {
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            parsed = { raw: content };
          }
        } else {
          parsed = { raw: content };
        }
      }
    }

    return jsonResponse({ content, data: parsed, mode });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return errorResponse(msg, 500);
  }
});
