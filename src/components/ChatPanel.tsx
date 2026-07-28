import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Send, Volume2, Square, Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeech } from '@/hooks/useSpeech';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';

interface ChatPanelProps {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  loading?: boolean;
  error?: string | null;
  onSend: (text: string) => void;
  voiceEnabled?: boolean;
  placeholder?: string;
  autoSpeak?: boolean;
  ttsVoice?: string;
  ttsRate?: number;
  disabled?: boolean;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
      parts.push(<strong key={`${keyPrefix}-b-${key++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) parts.push(remaining.slice(0, italicMatch.index));
      parts.push(<em key={`${keyPrefix}-i-${key++}`}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) parts.push(remaining.slice(0, codeMatch.index));
      parts.push(
        <code key={`${keyPrefix}-c-${key++}`} className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 text-[0.85em] font-mono">
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    parts.push(remaining.replace(/\*+/g, '').replace(/^#+\s/gm, ''));
    break;
  }

  return parts;
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.match(/^[-*]\s+/)) {
          const itemContent = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex gap-1.5 my-0.5">
              <span className="shrink-0 text-muted">•</span>
              <span>{renderInline(itemContent, `l${idx}`)}</span>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex gap-1.5 my-0.5">
              <span className="shrink-0 text-muted">{numberedMatch[1]}.</span>
              <span>{renderInline(numberedMatch[2], `l${idx}`)}</span>
            </div>
          );
        }

        if (trimmed === '') return <div key={idx} className="h-2" />;

        return <div key={idx}>{renderInline(line, `l${idx}`)}</div>;
      })}
    </>
  );
}

export function ChatPanel({
  messages,
  loading,
  error,
  onSend,
  voiceEnabled = true,
  placeholder = 'Type your answer...',
  autoSpeak = false,
  ttsVoice,
  ttsRate = 1,
  disabled,
}: ChatPanelProps) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { listening, speaking, supported, ttsSupported, interimText, startListening, stopListening, speak, stopSpeaking } = useSpeech();
  const lastSpokenRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!autoSpeak || !ttsSupported) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && last.content !== lastSpokenRef.current) {
      lastSpokenRef.current = last.content;
      speak(last.content, { voice: ttsVoice, rate: ttsRate });
    }
  }, [messages, autoSpeak, ttsSupported, speak, ttsVoice, ttsRate]);

  useEffect(() => {
    if (listening && interimText) {
      setText(interimText);
    }
  }, [interimText, listening]);

  const submit = () => {
    if (!text.trim() || loading || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    setText('');
    startListening((transcript) => {
      if (transcript) setText(transcript);
    });
  };

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      return;
    }
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) speak(lastAssistant.content, { voice: ttsVoice, rate: ttsRate });
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 code-scroll">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="h-14 w-14 rounded-2xl surface-2 border border-app flex items-center justify-center mb-3">
              <Mic className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm text-muted max-w-xs">Start the conversation by typing or using your voice below.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-3 animate-fade-in', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="h-8 w-8 shrink-0 rounded-lg surface-2 border border-app flex items-center justify-center text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-primary text-primary-fg rounded-br-md'
                  : 'surface border border-app text-main rounded-bl-md',
              )}
            >
              <FormattedMessage content={m.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="h-8 w-8 shrink-0 rounded-lg surface-2 border border-app flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="surface border border-app rounded-2xl rounded-bl-md px-4 py-3">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-error-500/30 bg-error-500/5 px-4 py-2.5 text-sm text-error-600 dark:text-error-400">
            {error}
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-app pt-3">
        {listening && (
          <div className="flex items-center gap-2 mb-2 text-xs text-primary animate-pulse">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>Listening... speak naturally, pauses are OK</span>
          </div>
        )}
        <div className="flex items-end gap-1.5 sm:gap-2">
          {voiceEnabled && supported && (
            <button
              onClick={handleMic}
              className={cn(
                'btn-secondary !px-3 !py-2.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center',
                listening && '!border-error-500 !text-error-500 animate-pulse',
              )}
              title={listening ? 'Stop listening' : 'Start voice input'}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
            >
              {listening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
          {voiceEnabled && ttsSupported && (
            <button
              onClick={toggleSpeak}
              className={cn(
                'btn-secondary !px-3 !py-2.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center',
                speaking && '!border-primary !text-primary',
              )}
              title={speaking ? 'Stop speech' : 'Read last AI message'}
              aria-label={speaking ? 'Stop speech' : 'Read last AI message'}
            >
              {speaking ? <Square className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={listening ? 'Listening to your voice...' : placeholder}
            disabled={disabled || loading}
            rows={1}
            className="input-field resize-none min-h-[44px] max-h-32 flex-1"
          />
          <Button onClick={submit} loading={loading} disabled={!text.trim() || disabled} className="!px-3 shrink-0 min-h-[44px] min-w-[44px]">
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {voiceEnabled && !supported && (
          <p className="mt-1.5 text-xs text-muted">Voice input isn't supported in this browser. Use Chrome or Edge.</p>
        )}
      </div>
    </div>
  );
}
