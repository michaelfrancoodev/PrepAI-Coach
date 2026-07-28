import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Mic,
  Code2,
  Users,
  Award,
  Sparkles,
  Flame,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Lightbulb,
  Network,
  Trophy,
  Brain,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { Tabs } from '@/components/ui/Tabs';
import { LineTrend, BarCompare, RadarSkills } from '@/components/ui/Charts';
import { useAuth } from '@/context/AuthContext';
import { useSessions, useSkillScores, useAchievements } from '@/hooks/useData';
import { callAi } from '@/lib/ai';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* AI insights shape                                                  */
/* ------------------------------------------------------------------ */

interface AiInsight {
  insights: string[];
  recommendations: string[];
  patterns: string[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

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
function typeIcon(type: string) {
  if (type === 'english') return Mic;
  if (type === 'coding') return Code2;
  if (type === 'interview') return Users;
  return Network;
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function AnalyticsPage() {
  useDocumentTitle('Analytics');
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(100);
  const { scores } = useSkillScores();
  const { achievements } = useAchievements();

  const [insights, setInsights] = useState<AiInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  /* Derived metrics */
  const completed = sessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.score ?? 0), 0) / completed.length)
    : 0;
  const streak = profile?.streak_count ?? 0;

  /* English progress: line trend of english session scores over time */
  const englishSessions = completed
    .filter((s) => s.type === 'english')
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  const englishData = englishSessions.map((s, i) => ({
    label: `#${i + 1}`,
    value: s.score ?? 0,
  }));

  /* Coding progress: bar compare of avg coding score by category */
  const codingSessions = completed.filter((s) => s.type === 'coding');
  const codingByCategory = new Map<string, { sum: number; count: number }>();
  for (const s of codingSessions) {
    const key = s.category || 'general';
    const cur = codingByCategory.get(key) ?? { sum: 0, count: 0 };
    cur.sum += s.score ?? 0;
    cur.count += 1;
    codingByCategory.set(key, cur);
  }
  const codingData = [...codingByCategory.entries()].map(([label, v]) => ({
    label: label.replace(/_/g, ' '),
    value: Math.round(v.sum / v.count),
  }));

  /* Interview progress: radar of latest score per interview skill */
  const interviewSkills = scores.filter((s) =>
    /communication|clarity|structure|technical|behavioral|leadership|problem/i.test(s.skill),
  );
  const radarBySkill = new Map<string, number>();
  for (const s of interviewSkills) {
    radarBySkill.set(s.skill, s.score);
  }
  const radarData = [...radarBySkill.entries()].map(([label, value]) => ({
    label: label.replace(/_/g, ' '),
    value,
  }));

  /* Interview score trend */
  const interviewSessions = completed
    .filter((s) => s.type === 'interview')
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  const interviewTrend = interviewSessions.map((s, i) => ({ label: `#${i + 1}`, value: s.score ?? 0 }));

  /* Company readiness: average score per company-tagged session */
  const companies = useMemo(() => profile?.preferred_companies ?? [], [profile?.preferred_companies]);
  const companyReadiness = useMemo(() => {
    return companies.map((company) => {
      const companySessions = completed.filter(
        (s) => s.category === 'company' && s.title?.toLowerCase().includes(company.toLowerCase()),
      );
      const pool = companySessions.length > 0 ? companySessions : completed;
      const avg = pool.length
        ? Math.round(pool.reduce((acc, s) => acc + (s.score ?? 0), 0) / pool.length)
        : 0;
      return { company, score: avg };
    });
  }, [companies, completed]);

  /* AI insights on mount (uses recent sessions as context) */
  useEffect(() => {
    let active = true;
    setInsightsLoading(true);
    (async () => {
      try {
        const resp = await callAi<AiInsight>({
          mode: 'coach_feedback',
          context: {
            experience_level: profile?.experience_level,
            goals: profile?.goals,
            target_companies: profile?.preferred_companies,
            recent_sessions: sessions.slice(0, 12).map((s) => ({
              type: s.type,
              category: s.category,
              score: s.score,
              duration_seconds: s.duration_seconds,
            })),
            skill_scores: scores.slice(-12).map((s) => ({ skill: s.skill, score: s.score })),
          },
          temperature: 0.5,
        });
        if (active) setInsights(resp.data ?? null);
      } catch {
        if (active) setInsights(null);
      } finally {
        if (active) setInsightsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab sessions={sessions} loading={loading} totalMinutes={totalMinutes} avgScore={avgScore} streak={streak} />,
    },
    {
      id: 'english',
      label: 'English',
      content: <EnglishTab data={englishData} sessions={englishSessions} />,
    },
    {
      id: 'coding',
      label: 'Coding',
      content: <CodingTab data={codingData} sessions={codingSessions} />,
    },
    {
      id: 'interviews',
      label: 'Interviews',
      content: <InterviewTab radar={radarData} trend={interviewTrend} sessions={interviewSessions} />,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      content: <AchievementsTab achievements={achievements} />,
    },
    {
      id: 'ai',
      label: 'AI Insights',
      content: <AiInsightsTab insights={insights} loading={insightsLoading} />,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Analytics"
        description="Track your progress across English, coding, interviews, and system design. See trends, achievements, and AI-generated insights."
        icon={<BarChart3 className="h-5 w-5" />}
        action={
          <Badge variant="primary" dot>
            {completed.length} completed
          </Badge>
        }
      />

      {/* Overview stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Target} label="Total sessions" value={String(sessions.length)} color="text-primary" />
        <StatCard icon={Clock} label="Total minutes" value={String(totalMinutes)} color="text-accent-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={Flame} label="Current streak" value={String(streak)} color="text-warning-500" suffix=" days" />
      </div>

      {/* Company readiness (always visible at top) */}
      {companies.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Company Readiness
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyReadiness.map((c) => (
              <div key={c.company} className="rounded-xl surface-2 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-main">{c.company}</span>
                  <span className={cn('text-sm font-bold', scoreColorClass(c.score))}>{c.score}%</span>
                </div>
                <Progress value={c.score} color={scoreProgressColor(c.score)} size="md" showLabel />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs tabs={tabs} defaultTab="overview" />
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value, color, suffix }: { icon: typeof Flame; label: string; value: string; color: string; suffix?: string }) {
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <p className="font-display text-2xl font-bold text-main">
        {value}<span className="text-sm text-muted font-normal">{suffix}</span>
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Overview tab                                                       */
/* ------------------------------------------------------------------ */

function OverviewTab({
  sessions,
  loading,
  totalMinutes,
  avgScore,
  streak,
}: {
  sessions: ReturnType<typeof useSessions>['sessions'];
  loading: boolean;
  totalMinutes: number;
  avgScore: number;
  streak: number;
}) {
  const navigate = useNavigate();
  if (loading) return <LoadingState message="Loading your activity..." />;
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-10 w-10" />}
        title="No data yet"
        description="Start practicing to see your analytics come to life."
        action={<Button onClick={() => navigate('/app/interviews')}>Start a session</Button>}
      />
    );
  }
  const byType = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-4">Activity by type</h3>
        <div className="space-y-3">
          {Object.entries(byType).map(([type, count]) => {
            const Icon = typeIcon(type);
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-main capitalize flex-1">{type.replace(/_/g, ' ')}</span>
                <Badge variant="primary">{count}</Badge>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 className="font-display font-semibold text-main mb-4">At a glance</h3>
        <div className="space-y-3">
          <Glance label="Total sessions" value={String(sessions.length)} />
          <Glance label="Total minutes" value={String(totalMinutes)} />
          <Glance label="Avg score" value={`${avgScore}/100`} />
          <Glance label="Current streak" value={`${streak} days`} />
        </div>
      </Card>
    </div>
  );
}

function Glance({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl surface-2 p-3">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-bold text-main">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* English tab                                                        */
/* ------------------------------------------------------------------ */

function EnglishTab({ data, sessions }: { data: { label: string; value: number }[]; sessions: { id: string; score: number | null; duration_seconds: number; started_at: string }[] }) {
  if (sessions.length === 0) {
    return <EmptyState icon={<Mic className="h-10 w-10" />} title="No English sessions yet" description="Practice English speaking to see your progress trend here." />;
  }
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          English score trend
        </h3>
        <div className="overflow-x-auto">
          <LineTrend data={data} color="#06b6d4" height={240} />
        </div>
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="!p-5"><Metric label="English sessions" value={String(sessions.length)} /></Card>
        <Card className="!p-5">
          <Metric label="Avg score" value={`${Math.round(sessions.reduce((a, s) => a + (s.score ?? 0), 0) / sessions.length)}/100`} />
        </Card>
        <Card className="!p-5">
          <Metric label="Total minutes" value={String(Math.round(sessions.reduce((a, s) => a + s.duration_seconds, 0) / 60))} />
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coding tab                                                         */
/* ------------------------------------------------------------------ */

function CodingTab({ data, sessions }: { data: { label: string; value: number }[]; sessions: { id: string }[] }) {
  if (sessions.length === 0) {
    return <EmptyState icon={<Code2 className="h-10 w-10" />} title="No coding sessions yet" description="Solve coding problems to see category comparisons here." />;
  }
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Coding scores by category
        </h3>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <BarCompare data={data} color="#10b981" height={240} />
          </div>
        ) : (
          <p className="text-sm text-muted">Not enough data to compare categories yet.</p>
        )}
      </Card>
      <Card className="!p-5">
        <Metric label="Problems solved" value={String(sessions.length)} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interview tab                                                      */
/* ------------------------------------------------------------------ */

function InterviewTab({
  radar,
  trend,
  sessions,
}: {
  radar: { label: string; value: number }[];
  trend: { label: string; value: number }[];
  sessions: { id: string }[];
}) {
  if (sessions.length === 0 && radar.length === 0) {
    return <EmptyState icon={<Users className="h-10 w-10" />} title="No interview data yet" description="Complete mock interviews to see your skill breakdown and score trend." />;
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Interview skill breakdown
        </h3>
        {radar.length >= 3 ? (
          <div className="overflow-x-auto">
            <RadarSkills data={radar} height={280} />
          </div>
        ) : (
          <p className="text-sm text-muted py-8 text-center">Need at least 3 scored skills to render the radar chart.</p>
        )}
      </Card>
      <Card>
        <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Interview score trend
        </h3>
        {trend.length > 0 ? (
          <div className="overflow-x-auto">
            <LineTrend data={trend} color="#3b82f6" height={240} />
          </div>
        ) : (
          <p className="text-sm text-muted py-8 text-center">No scored interview sessions yet.</p>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Achievements tab                                                   */
/* ------------------------------------------------------------------ */

function AchievementsTab({ achievements }: { achievements: ReturnType<typeof useAchievements>['achievements'] }) {
  if (achievements.length === 0) {
    return <EmptyState icon={<Award className="h-10 w-10" />} title="No achievements yet" description="Keep practicing to unlock your first achievement!" />;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((a) => (
        <Card key={a.id} hover className="text-center">
          <div className="h-14 w-14 rounded-2xl surface-2 border border-app flex items-center justify-center mx-auto mb-3">
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-main">{a.title}</h3>
          {a.description && <p className="text-xs text-muted mt-1">{a.description}</p>}
          <Badge variant="success" className="mt-3" dot>
            {timeAgo(a.unlocked_at)}
          </Badge>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI insights tab                                                    */
/* ------------------------------------------------------------------ */

function AiInsightsTab({ insights, loading }: { insights: AiInsight | null; loading: boolean }) {
  if (loading) {
    return (
      <Card>
        <LoadingState message="Analyzing your sessions and generating insights..." />
      </Card>
    );
  }
  if (!insights) {
    return (
      <EmptyState
        icon={<Sparkles className="h-10 w-10" />}
        title="Insights unavailable"
        description="We couldn't generate AI insights right now. Complete a few more sessions and try again."
      />
    );
  }
  return (
    <div className="space-y-6">
      {insights.insights.length > 0 && (
        <Card>
          <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Insights
          </h3>
          <ul className="space-y-2">
            {insights.insights.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {insights.patterns.length > 0 && (
        <Card>
          <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent-500" />
            Patterns we noticed
          </h3>
          <ul className="space-y-2">
            {insights.patterns.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircle2 className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {insights.recommendations.length > 0 && (
        <Card>
          <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-success-500" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {insights.recommendations.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <Target className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small metric helper                                                */
/* ------------------------------------------------------------------ */

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl font-bold text-main">{value}</p>
    </div>
  );
}
