import { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Loader2, Radio } from 'lucide-react';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import { cn } from '@/lib/utils';

interface LiveVoicePanelProps {
  systemInstruction: string;
  onTranscriptLine?: (role: 'user' | 'assistant', text: string) => void;
  /** When true, the in-panel "End" control is disabled — the parent's timer controls when the session can stop. */
  locked?: boolean;
  /** Seconds left in the timed session, shown next to the mic while connected. */
  remainingSeconds?: number;
  /** Reports whether the live voice socket is actually connected — the parent uses this to know when to start counting down, instead of starting the timer the instant this panel is shown. */
  onConnectionChange?: (connected: boolean) => void;
  /** Called when the error looks like a quota problem, so the parent can offer a one-click switch to Text mode. */
  onQuotaExceeded?: () => void;
}

export function LiveVoicePanel({ systemInstruction, onTranscriptLine, locked, remainingSeconds, onConnectionChange, onQuotaExceeded }: LiveVoicePanelProps) {
  const [lines, setLines] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [liveLine, setLiveLine] = useState<{ role: 'user' | 'assistant'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { start, stop, connected, connecting, userSpeaking, aiSpeaking } = useGeminiLive({
    systemInstruction,
    onTranscript: (role, text, isFinal) => {
      if (isFinal) {
        setLines((prev) => [...prev, { role, text }]);
        setLiveLine((prev) => (prev?.role === role ? null : prev));
        onTranscriptLine?.(role, text);
      } else {
        setLiveLine({ role, text });
      }
    },
    onError: (message) => setError(message),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines, liveLine]);

  useEffect(() => {
    onConnectionChange?.(connected);
  }, [connected, onConnectionChange]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      {/* Status */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-3 sm:py-4">
        <div
          className={cn(
            'relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full transition-all duration-300 shrink-0',
            connected
              ? aiSpeaking
                ? 'bg-brand-500/20 scale-110'
                : userSpeaking
                  ? 'bg-success-500/20 scale-105'
                  : 'bg-primary/10'
              : 'surface-2',
          )}
        >
          {connected && (aiSpeaking || userSpeaking) && (
            <span
              className={cn(
                'absolute inset-0 rounded-full animate-ping',
                aiSpeaking ? 'bg-brand-500/30' : 'bg-success-500/30',
              )}
            />
          )}
          {connecting ? (
            <Loader2 className="h-8 w-8 sm:h-9 sm:w-9 text-primary animate-spin" />
          ) : (
            <Mic className={cn('h-8 w-8 sm:h-9 sm:w-9', connected ? 'text-primary' : 'text-muted')} />
          )}
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-muted px-4 min-h-[1.25rem]">
        {connecting && 'Connecting to your live interviewer...'}
        {connected && aiSpeaking && 'Interviewer is speaking — jump in anytime.'}
        {connected && !aiSpeaking && userSpeaking && 'Listening...'}
        {connected && !aiSpeaking && !userSpeaking && 'Your turn — speak naturally, no need to rush.'}
        {!connected && !connecting && 'Tap start to begin a real-time voice interview.'}
      </p>

      {error && (
        <div className="mx-4 mt-2 rounded-xl border border-error-500/30 bg-error-500/5 px-3 py-2 text-xs sm:text-sm text-error-600 dark:text-error-400 text-center">
          {error}
          {onQuotaExceeded && /quota/i.test(error) && (
            <button
              onClick={onQuotaExceeded}
              className="block mx-auto mt-1.5 text-xs font-semibold underline underline-offset-2"
            >
              Switch to Text mode now
            </button>
          )}
        </div>
      )}

      {/* Live transcript */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-3 space-y-2 code-scroll">
        {lines.length === 0 && !liveLine && !connecting && (
          <div className="h-full flex items-center justify-center text-center text-xs sm:text-sm text-muted px-6">
            Your conversation will appear here as you speak.
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className={cn('flex', line.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[90%] sm:max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words',
                line.role === 'user' ? 'bg-primary text-primary-fg rounded-br-md' : 'surface border border-app text-main rounded-bl-md',
              )}
            >
              {line.text}
            </div>
          </div>
        ))}
        {liveLine && (
          <div className={cn('flex', liveLine.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[90%] sm:max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words opacity-80',
                liveLine.role === 'user' ? 'bg-primary text-primary-fg rounded-br-md' : 'surface border border-app text-main rounded-bl-md',
              )}
            >
              {liveLine.text}
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-current animate-pulse align-middle" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-app px-3 sm:px-4 py-3 flex flex-col items-center justify-center gap-1.5">
        {!connected ? (
          <button
            onClick={start}
            disabled={connecting}
            className="btn-primary flex items-center gap-2 !px-6 !py-3 min-h-[48px] w-full sm:w-auto justify-center"
          >
            {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Radio className="h-5 w-5" />}
            {connecting ? 'Connecting...' : 'Start Live Interview'}
          </button>
        ) : locked ? (
          <div className="flex flex-col items-center gap-1">
            <button
              disabled
              className="flex items-center gap-2 !px-6 !py-3 min-h-[48px] w-full sm:w-auto justify-center rounded-xl surface-2 text-muted font-medium opacity-70 cursor-not-allowed"
            >
              <PhoneOff className="h-5 w-5" />
              {typeof remainingSeconds === 'number' ? `Locked — ${Math.ceil(remainingSeconds / 60)} min left` : 'In progress'}
            </button>
            <p className="text-[11px] text-muted text-center px-6">
              Use "Exit early" above the transcript only for a real emergency.
            </p>
          </div>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 !px-6 !py-3 min-h-[48px] w-full sm:w-auto justify-center rounded-xl bg-error-500 text-white font-medium hover:bg-error-600 transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
            End Interview
          </button>
        )}
      </div>
    </div>
  );
}
