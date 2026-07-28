import { useCallback, useRef, useState } from 'react';
import { callAi } from '@/lib/ai';
import type { ChatMessage } from '@/lib/types';

interface UseAiChatArgs {
  mode: string;
  systemContext?: Record<string, unknown>;
  temperature?: number;
  speakResponse?: boolean;
}

export function useAiChat({ mode, systemContext, temperature, speakResponse }: UseAiChatArgs) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<ChatMessage[]>([]);

  const send = useCallback(
    async (text: string): Promise<string | null> => {
      if (!text.trim() || loading) return null;
      setLoading(true);
      setError(null);
      const userMsg: ChatMessage = { role: 'user', content: text };
      // IMPORTANT: history is prior context ONLY. The new message goes once,
      // via user_message below — previously this also appeared as the last
      // item of history, so the backend saw it twice in a row and Gemini's
      // replies would sometimes echo/repeat themselves.
      const priorHistory = historyRef.current.slice(-12);
      setMessages((m) => [...m, userMsg]);
      historyRef.current = [...historyRef.current, userMsg];

      try {
        const resp = await callAi({
          mode,
          history: priorHistory,
          userMessage: text,
          context: systemContext,
          temperature,
        });
        const assistantMsg: ChatMessage = { role: 'assistant', content: resp.content };
        setMessages((m) => [...m, assistantMsg]);
        historyRef.current = [...historyRef.current, assistantMsg];
        return resp.content;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI request failed';
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mode, systemContext, temperature, loading],
  );

  const reset = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
  }, []);

  return { messages, loading, error, send, reset, speakResponse };
}
