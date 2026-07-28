import { AI_FUNCTION_URL, supabase } from './supabase';
import type { AiResponse, ChatMessage } from './types';

interface CallAiArgs {
  mode: string;
  userMessage?: string;
  history?: ChatMessage[];
  messages?: ChatMessage[];
  context?: Record<string, unknown>;
  temperature?: number;
}

export async function callAi<T = unknown>(args: CallAiArgs): Promise<AiResponse<T>> {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(AI_FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mode: args.mode,
      user_message: args.userMessage,
      history: args.history,
      messages: args.messages,
      context: args.context,
      temperature: args.temperature,
    }),
  });

  if (!resp.ok) {
    let message = `AI request failed (${resp.status})`;
    try {
      const err = await resp.json();
      if (err?.error) message = err.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const json = (await resp.json()) as AiResponse<T>;
  if (!json || typeof json.content !== 'string') {
    throw new Error('AI returned an unexpected response shape');
  }
  return json;
}
