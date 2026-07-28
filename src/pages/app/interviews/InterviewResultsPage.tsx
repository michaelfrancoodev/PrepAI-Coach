import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Target,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {} from '@/components/ui/Tabs';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { LineTrend } from '@/components/ui/Charts';
import { useSessions } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, formatDate, formatTime } from '@/lib/utils';
import type { PracticeSession } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* Interview type metadata for display                                */
/* ------------------------------------------------------------------ */

interface TypeMeta {
  label: string;
  icon: LucideIcon;
  gradient: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  hr: { label: 'HR Interview', icon: Users, gradient: 'surface-2 border border-app' },
  behavioral: { label: 'Behavioral', icon: Users, gradient: 'surface-2 border border-app' },
  technical: { label: 'Technical', icon: Users, gradient: 'surface-2 border border-app' },
  coding: { label: 'Coding', icon: Users, gradient: 'surface-2 border border-app' },
  frontend: { label: 'Frontend', icon: Users, gradient: 'surface-2 border border-app' },
  backend: { label: 'Backend', icon: Users, gradient: 'surface-2 border border-app' },
  fullstack: { label: 'Full Stack', icon: Users, gradient: 'surface-2 border border-app' },
  devops: { label: 'DevOps', icon: Users, gradient: 'surface-2 border border-app' },
  system_design: { label: 'System Design', icon: Users, gradient: 'surface-2 border border-app' },
  product_manager: { label: 'Product Manager', icon: Users, gradient: 'surface-2 border border-app' },
  data_science: { label: 'Data Science', icon: Users, gradient: 'surface-2 border border-app' },
  ai_ml: { label: 'AI/ML', icon: Users, gradient: 'surface-2 border border-app' },
  company: { label: 'Company Interview', icon: Users, gradient: 'surface-2 border border-app' },
};

function metaFor(category: string): TypeMeta {
  return (
    TYPE_META[category] ?? {
      label: category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: Users,
      gradient: 'surface-2 border border-app',
    }
  );
}

/* ------------------------------------------------------------------ */
/* Feedback shape (stored in session.feedback JSONB)                  */
/* ------------------------------------------------------------------ */

interface SessionFeedback {
  score?: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  key_moments?: string[];
  category_scores?: { name: string; score: number }[];
}

function readFeedback(session: PracticeSession): SessionFeedback {
  const f = session.feedback as Record<string, unknown> | null;
  if (!f) return {};
  const pickStrArr = (key: string): string[] =>
    Array.isArray(f[key]) ? (f[key] as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  return {
    score: typeof f.score === 'number' ? f.score : undefined,
    summary: typeof f.summary === 'string' ? f.summary : undefined,
    strengths: pickStrArr('strengths'),
    weaknesses: pickStrArr('weaknesses'),
    recommendations: pickStrArr('recommendations'),
    key_moments: pickStrArr('key_moments'),
    category_scores: Array.isArray(f.category_scores)
      ? (f.category_scores as unknown[])
          .filter(
            (c): c is { name: string; score: number } =>
              typeof c === 'object' && c !== null && typeof (c as Record<string, unknown>).name === 'string' && typeof (c as Record<string, unknown>).score === 'number',
          )
      : [],
  };
}

function scoreBadgeVariant(score: number | null): 'success' | 'warning' | 'error' | 'default' {
  if (score === null) return 'default';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}
function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-success-500';
  if (score >= 60) return 'text-warning-500';
  return 'text-error-500';
}
function scoreProgressColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

/* ------------------------------------------------------------------ */
/* Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  suffix?: string;
}) {
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-main">
        {value}
        <span className="text-sm text-muted font-normal">{suffix}</span>
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Expandable result card                                             */
/* ------------------------------------------------------------------ */

function ResultCard({ session }: { session: PracticeSession }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const meta = metaFor(session.category);
  const feedback = readFeedback(session);
  const score = session.score ?? feedback.score ?? null;
  const Icon = meta.icon;

  return (
    <Card className="!p-4 animate-fade-in">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', meta.gradient)}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-main truncate">
            {session.title ?? meta.label}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="primary">{meta.label}</Badge>
            <span className="text-xs text-muted flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(session.started_at)}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(session.duration_seconds)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {score !== null ? (
            <Badge variant={scoreBadgeVariant(score)} className="text-base font-bold !px-3 !py-1">
              {score}
            </Badge>
          ) : (
            <Badge variant="default">No score</Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-app space-y-4 animate-fade-in">
          {/* Summary */}
          {feedback.summary && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Summary</h4>
              <p className="text-sm text-main leading-relaxed">{feedback.summary}</p>
            </div>
          )}

          {/* Category scores */}
          {feedback.category_scores && feedback.category_scores.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Category scores</h4>
              <div className="space-y-2.5">
                {feedback.category_scores.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-main">{c.name}</span>
                      <span className={cn('text-xs font-bold', scoreColorClass(c.score))}>{c.score}</span>
                    </div>
                    <Progress value={c.score} max={100} color={scoreProgressColor(c.score)} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-success-500" />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning-500" />
                  Areas to improve
                </h4>
                <ul className="space-y-1.5">
                  {feedback.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning-500 shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {feedback.recommendations && feedback.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-accent-500" />
                Recommendations
              </h4>
              <ul className="space-y-1.5">
                {feedback.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <Sparkles className="h-3.5 w-3.5 text-accent-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Retake */}
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/app/interviews/${session.category === 'system_design' ? 'system-design' : session.category}`)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Practice this type
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function InterviewResultsPage() {
  useDocumentTitle('Interview Results');
  const navigate = useNavigate();
  const { sessions, loading } = useSessions(100);

  const interviewSessions = useMemo(
    () => sessions.filter((s) => s.type === 'interview'),
    [sessions],
  );
  const completed = useMemo(
    () => interviewSessions.filter((s) => s.status === 'completed' && s.score !== null),
    [interviewSessions],
  );

  const total = interviewSessions.length;
  const avgScore = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.score ?? 0), 0) / completed.length)
    : 0;
  const bestScore = completed.length ? Math.max(...completed.map((s) => s.score ?? 0)) : 0;

  /* by-type breakdown */
  const byType = useMemo(() => {
    const map: Record<string, { count: number; totalScore: number; scored: number }> = {};
    for (const s of interviewSessions) {
      const key = s.category;
      if (!map[key]) map[key] = { count: 0, totalScore: 0, scored: 0 };
      map[key].count += 1;
      if (s.score !== null) {
        map[key].totalScore += s.score;
        map[key].scored += 1;
      }
    }
    return Object.entries(map)
      .map(([cat, v]) => ({
        category: cat,
        count: v.count,
        scored: v.scored,
        avgScore: v.scored ? Math.round(v.totalScore / v.scored) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [interviewSessions]);

  /* score trend over time (chronological) */
  const trendData = useMemo(
    () =>
      completed
        .slice()
        .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
        .map((s) => ({
          label: formatDate(s.started_at, { month: 'short', day: 'numeric' }),
          value: s.score ?? 0,
        })),
    [completed],
  );

  /* filter tabs */
  const categories = useMemo(() => {
    const set = new Set(interviewSessions.map((s) => s.category));
    return Array.from(set).sort();
  }, [interviewSessions]);

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSessions = useMemo(
    () =>
      activeFilter === 'all'
        ? interviewSessions
        : interviewSessions.filter((s) => s.category === activeFilter),
    [interviewSessions, activeFilter],
  );

  const tabs = [
    { id: 'all', label: `All (${interviewSessions.length})`, content: null },
    ...categories.map((cat) => {
      const meta = metaFor(cat);
      const count = interviewSessions.filter((s) => s.category === cat).length;
      return { id: cat, label: `${meta.label} (${count})`, content: null };
    }),
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Interview Results"
        description="Track your interview performance over time, review feedback, and identify areas to improve."
        icon={<TrendingUp className="h-5 w-5" />}
        action={
          <Button
            onClick={() => navigate('/app/interviews')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            variant="secondary"
            size="sm"
          >
            Back to interviews
          </Button>
        }
      />

      {loading ? (
        <LoadingState message="Loading your interview history..." />
      ) : interviewSessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No interviews yet"
            description="Complete your first mock interview to see detailed results, scores, and feedback here."
            action={
              <Button onClick={() => navigate('/app/interviews')} leftIcon={<Sparkles className="h-4 w-4" />}>
                Start an interview
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard icon={Target} label="Total interviews" value={String(total)} color="text-accent-500" />
            <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
            <StatCard icon={Award} label="Best score" value={`${bestScore}`} color="text-warning-500" suffix="/100" />
            <StatCard icon={CheckCircle2} label="Completed" value={String(completed.length)} color="text-brand-500" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Trend chart */}
            <div className="lg:col-span-2">
              <Card>
                <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Score trend over time
                </h3>
                {trendData.length > 0 ? (
                  <div className="w-full overflow-x-auto -mx-1 px-1">
                    <LineTrend data={trendData} height={220} color="#3b82f6" />
                  </div>
                ) : (
                  <EmptyState
                    icon={<TrendingUp className="h-8 w-8" />}
                    title="No scored interviews yet"
                    description="Complete an interview to start tracking your score trend."
                  />
                )}
              </Card>
            </div>

            {/* By-type breakdown */}
            <Card>
              <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                By type
              </h3>
              <div className="space-y-3">
                {byType.map((t) => {
                  const meta = metaFor(t.category);
                  const Icon = meta.icon;
                  return (
                    <div key={t.category} className="flex items-center gap-3">
                      <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', meta.gradient)}>
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-main truncate">{meta.label}</p>
                        <p className="text-xs text-muted">{t.count} session{t.count !== 1 ? 's' : ''}</p>
                      </div>
                      {t.scored > 0 && (
                        <Badge variant={scoreBadgeVariant(t.avgScore)}>{t.avgScore}</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Filterable list */}
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold text-main mb-3">All results</h2>
            <div className="flex flex-wrap gap-1 border-b border-app surface rounded-xl p-1 mb-4 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFilter(t.id)}
                  className={cn(
                    'px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[44px]',
                    activeFilter === t.id
                      ? 'bg-primary text-primary-fg'
                      : 'text-muted hover:text-main hover:surface-2',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {filteredSessions.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No sessions in this category"
                  description="Try another filter or start a new interview of this type."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((s) => (
                  <ResultCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
