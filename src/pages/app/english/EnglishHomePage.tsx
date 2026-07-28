import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  BookOpen,
  Volume2,
  Gauge,
  Headphones,
  Trophy,
  ArrowRight,
  History,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { useSessions, useVocabulary } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo, formatTime } from '@/lib/utils';

interface ModeCard {
  icon: typeof Mic;
  title: string;
  description: string;
  path: string;
  gradient: string;
  iconColor: string;
}

const MODES: ModeCard[] = [
  {
    icon: MessageSquare,
    title: 'Daily Conversation',
    description: 'Practice real-life English conversations on everyday topics with instant AI feedback.',
    path: '/app/english/conversation',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-brand-500',
  },
  {
    icon: BookOpen,
    title: 'Grammar Practice',
    description: 'Sharpen your grammar with targeted exercises and corrections you can save.',
    path: '/app/english/grammar',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-accent-500',
  },
  {
    icon: Mic,
    title: 'Vocabulary Builder',
    description: 'Learn new words with context, examples, and a spaced-review system.',
    path: '/app/english/vocabulary',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-success-500',
  },
  {
    icon: Volume2,
    title: 'Pronunciation',
    description: 'Refine your pronunciation and intonation through guided speaking drills.',
    path: '/app/english/pronunciation',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-brand-500',
  },
  {
    icon: Gauge,
    title: 'Fluency Practice',
    description: 'Build speed and confidence with timed speaking prompts and flow coaching.',
    path: '/app/english/fluency',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-accent-500',
  },
  {
    icon: Headphones,
    title: 'Listening',
    description: 'Train your ear with comprehension exercises and natural spoken English.',
    path: '/app/english/listening',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-success-500',
  },
  {
    icon: Trophy,
    title: 'Speaking Challenge',
    description: 'Take on advanced speaking challenges and earn a scored evaluation.',
    path: '/app/english/speaking-challenge',
    gradient: 'surface-2 border border-app',
    iconColor: 'text-brand-500',
  },
];

export function EnglishHomePage() {
  useDocumentTitle('English Speaking');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(50);
  const { items: vocab, loading: vocabLoading } = useVocabulary();

  const englishSessions = useMemo(() => sessions.filter((s) => s.type === 'english'), [sessions]);
  const recentSessions = englishSessions.slice(0, 4);
  const completedSessions = englishSessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(englishSessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / completedSessions.length)
    : 0;

  return (
    <AppLayout>
      <PageHeader
        title="English Speaking"
        description="Build fluency, grammar, and confidence with AI-guided speaking practice tailored to your level."
        icon={<Mic className="h-5 w-5" />}
        action={
          <Button onClick={() => navigate('/app/english/report')} rightIcon={<ArrowRight className="h-4 w-4" />}>
            View report
          </Button>
        }
      />

      {/* Stat overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={History} label="Sessions" value={String(englishSessions.length)} color="text-brand-500" />
        <StatCard icon={Clock} label="Minutes" value={String(totalMinutes)} color="text-accent-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={BookOpen} label="Vocabulary" value={String(vocab.length)} color="text-primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Practice modes */}
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold text-main mb-4">Practice modes</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {MODES.map((m, i) => (
              <button
                key={m.title}
                onClick={() => navigate(m.path)}
                className={cn(
                  'group card p-5 text-left hover:shadow-md transition-all animate-slide-up',
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                      m.gradient,
                    )}
                  >
                    <m.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-semibold text-main">{m.title}</h4>
                      <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Conversation history link */}
          <button
            onClick={() => navigate('/app/english/report')}
            className="mt-4 w-full card p-4 flex items-center justify-between text-left hover:surface-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-main">Conversation History</p>
                <p className="text-xs text-muted">Review past sessions, scores, and feedback</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted" />
          </button>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent sessions */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-main">Recent sessions</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/english/report')}>All</Button>
            </div>
            {loading ? (
              <LoadingState message="Loading sessions..." />
            ) : recentSessions.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-8 w-8" />}
                title="No sessions yet"
                description="Start a conversation or grammar drill to see your history here."
                action={<Button size="sm" onClick={() => navigate('/app/english/conversation')}>Start now</Button>}
              />
            ) : (
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                      <Mic className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{s.title ?? `${s.category} session`}</p>
                      <p className="text-xs text-muted">{timeAgo(s.started_at)} · {formatTime(s.duration_seconds)}</p>
                    </div>
                    {s.score !== null && (
                      <Badge variant={s.score >= 80 ? 'success' : s.score >= 60 ? 'warning' : 'error'}>
                        {s.score}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Vocabulary snapshot */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-main">My vocabulary</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/english/vocabulary')}>Open</Button>
            </div>
            {vocabLoading ? (
              <LoadingState message="Loading vocabulary..." />
            ) : vocab.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-8 w-8" />}
                title="No words saved"
                description="Learn new words in the Vocabulary Builder and they'll appear here."
                action={<Button size="sm" onClick={() => navigate('/app/english/vocabulary')}>Build vocabulary</Button>}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">{vocab.length} words saved</span>
                  <span className="text-muted">
                    Avg mastery{' '}
                    <span className="font-semibold text-main">
                      {Math.round(vocab.reduce((acc, v) => acc + v.mastery, 0) / vocab.length)}%
                    </span>
                  </span>
                </div>
                <Progress
                  value={vocab.reduce((acc, v) => acc + v.mastery, 0)}
                  max={vocab.length * 100}
                  color="success"
                />
                <div className="space-y-1.5 mt-2">
                  {vocab.slice(0, 3).map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <span className="text-sm text-main font-medium truncate flex-1">{v.word}</span>
                      <Progress value={v.mastery} color="primary" size="sm" className="w-16" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Coach tip */}
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-main">Daily tip</h3>
              </div>
              <p className="text-sm text-muted mb-4">
                {profile?.experience_level === 'beginner'
                  ? 'Focus on short, complete sentences. Accuracy first — speed comes with practice.'
                  : profile?.experience_level === 'advanced'
                    ? 'Push for nuance: idioms, collocations, and natural rhythm. Record yourself and compare.'
                    : 'Mix accuracy with flow. Try thinking in English for 5 minutes before each session.'}
              </p>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => navigate('/app/english/conversation')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start a conversation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: typeof Mic;
  label: string;
  value: string;
  color: string;
  suffix?: string;
}) {
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-main">
        {value}
        {suffix && <span className="text-sm text-muted font-normal">{suffix}</span>}
      </p>
    </Card>
  );
}
