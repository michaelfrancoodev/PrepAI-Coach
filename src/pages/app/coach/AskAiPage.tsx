import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Brain,
  Mic,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ChatPanel } from '@/components/ChatPanel';
import { useAuth } from '@/context/AuthContext';
import { useAiChat } from '@/hooks/useAiChat';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  { icon: HelpCircle, text: 'How should I prepare for a Google interview?', color: 'surface-2 border border-app' },
  { icon: Brain, text: 'What are my weak areas?', color: 'surface-2 border border-app' },
  { icon: Calendar, text: 'Give me a study plan for this week', color: 'surface-2 border border-app' },
  { icon: Mic, text: 'How can I improve my English pronunciation?', color: 'surface-2 border border-app' },
];

export function AskAiPage() {
  useDocumentTitle('Ask AI');
  const navigate = useNavigate();
  const { profile } = useAuth();

  const systemContext = useMemo<Record<string, unknown>>(
    () => ({
      display_name: profile?.display_name,
      experience_level: profile?.experience_level,
      goals: profile?.goals,
      target_role: profile?.target_role,
      target_companies: profile?.preferred_companies,
      streak_count: profile?.streak_count,
    }),
    [profile],
  );

  const { messages, loading, error, send } = useAiChat({
    mode: 'coach_ask',
    systemContext,
    temperature: 0.7,
  });

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/coach')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-xl surface-2 border border-app flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-lg font-bold text-main truncate">Ask AI Coach</h1>
                <p className="text-xs text-muted hidden sm:block">Personalized guidance on interviews, coding & English</p>
              </div>
            </div>
          </div>
          <Avatar name={profile?.display_name} src={profile?.avatar_url} size="sm" />
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
          {/* Chat area */}
          <Card className="!p-4 flex flex-col min-h-0">
            <ChatPanel
              messages={messages}
              loading={loading}
              error={error}
              onSend={send}
              voiceEnabled
              autoSpeak={profile?.voice_settings?.auto_listen ?? false}
              ttsVoice={profile?.ai_settings?.voice}
              ttsRate={profile?.ai_settings?.speed ?? 1}
              placeholder="Ask anything about interviews, coding, or English..."
            />
          </Card>

          {/* Sidebar: suggested questions + profile context */}
          <div className="hidden lg:flex flex-col gap-4 min-h-0">
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display font-semibold text-main text-sm">Suggested questions</h3>
              </div>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => send(q.text)}
                    disabled={loading}
                    className="group flex items-start gap-2 w-full text-left rounded-xl surface-2 p-2.5 hover:surface transition-all disabled:opacity-50"
                  >
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', q.color)}>
                      <q.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs text-main leading-snug flex-1 pt-1">{q.text}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1.5" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Context card */}
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-accent-500" />
                <h3 className="font-display font-semibold text-main text-sm">Your context</h3>
              </div>
              <div className="space-y-2 text-xs">
                <ContextRow label="Experience" value={profile?.experience_level ?? '—'} />
                <ContextRow label="Target role" value={profile?.target_role ?? '—'} />
                <ContextRow
                  label="Companies"
                  value={profile?.preferred_companies?.length ? profile.preferred_companies.join(', ') : '—'}
                />
                <ContextRow
                  label="Goals"
                  value={profile?.goals?.length ? `${profile.goals.length} goals` : '—'}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Mobile suggestions */}
        <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-1">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q.text}
              onClick={() => send(q.text)}
              disabled={loading}
              className="shrink-0 rounded-full surface-2 border border-app px-3 py-1.5 text-xs text-main hover:surface transition-all disabled:opacity-50"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="text-main font-medium truncate capitalize">{value}</span>
    </div>
  );
}
