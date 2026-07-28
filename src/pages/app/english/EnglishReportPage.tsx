import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  Mic,
  Clock,
  TrendingUp,
  Flame,
  Target,
  Award,
  AlertCircle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {} from '@/components/ui/Progress';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { LineTrend, BarCompare, RadarSkills, DonutChart } from '@/components/ui/Charts';
import { useAuth } from '@/context/AuthContext';
import { useSessions, useSkillScores, useMistakes } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { callAi } from '@/lib/ai';
import { timeAgo, formatTime } from '@/lib/utils';
import type { PracticeSession } from '@/lib/types';

interface CoachInsight {
  insight: string;
  highlights?: string[];
  recommendations?: string[];
}

export function EnglishReportPage() {
  useDocumentTitle('English Report');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(100);
  const { scores } = useSkillScores();
  const { items: mistakes, loading: mistakesLoading } = useMistakes();

  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const englishSessions = useMemo(
    () => sessions.filter((s) => s.type === 'english'),
    [sessions],
  );

  const englishScores = useMemo(
    () => scores.filter((s) => s.skill.toLowerCase().includes('english')),
    [scores],
  );
  const englishMistakes = useMemo(
    () => mistakes.filter((m) => m.category === 'english'),
    [mistakes],
  );

  const completedSessions = englishSessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(englishSessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / completedSessions.length)
    : 0;

  // Streak: consecutive days with at least one english session, counting back from today
  const streak = useMemo(() => {
    if (englishSessions.length === 0) return 0;
    const days = new Set(englishSessions.map((s) => new Date(s.started_at).toDateString()));
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (days.has(cursor.toDateString())) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [englishSessions]);

  // Score trend over recent sessions (chronological)
  const trendData = useMemo(() => {
    return [...completedSessions]
      .reverse()
      .slice(-10)
      .map((s, i) => ({
        label: `#${i + 1}`,
        value: s.score ?? 0,
      }));
  }, [completedSessions]);

  // Category breakdown (sessions per category)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of englishSessions) {
      const key = (s.category ?? 'other').replace(/_/g, ' ');
      map[key] = (map[key] ?? 0) + 1;
    }
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [englishSessions]);

  // Mastery breakdown across english skill scores
  const skillBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of englishScores) {
      const key = s.skill.replace(/english[_\s]*/i, '').trim() || s.skill;
      const normalized = s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : s.score;
      map[key] = Math.max(map[key] ?? 0, normalized);
    }
    if (Object.keys(map).length === 0) {
      // Derive from categories as a fallback
      const cats: Record<string, number> = {};
      for (const s of completedSessions) {
        const key = (s.category ?? 'general').replace(/_/g, ' ');
        cats[key] = Math.max(cats[key] ?? 0, s.score ?? 0);
      }
      return Object.entries(cats).map(([label, value]) => ({ label, value }));
    }
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [englishScores, completedSessions]);

  // Mastery donut: new vs learning vs mastered vocabulary-like buckets from scores
  const masteryDonut = useMemo(() => {
    const mastered = englishScores.filter((s) => s.score >= 80).length;
    const learning = englishScores.filter((s) => s.score >= 50 && s.score < 80).length;
    const emerging = englishScores.filter((s) => s.score < 50).length;
    return [
      { label: 'Mastered', value: mastered },
      { label: 'Learning', value: learning },
      { label: 'Emerging', value: emerging },
    ].filter((d) => d.value > 0);
  }, [englishScores]);

  // Fetch AI coach insight once data is available
  useEffect(() => {
    if (insight || insightLoading) return;
    if (englishSessions.length === 0) return;
    setInsightLoading(true);
    (async () => {
      try {
        const resp = await callAi<CoachInsight>({
          mode: 'coach_feedback',
          context: {
            area: 'english',
            english_level: profile?.experience_level ?? 'intermediate',
            total_sessions: englishSessions.length,
            avg_score: avgScore,
            streak,
            recent_scores: completedSessions.slice(0, 8).map((s) => s.score),
            categories: categoryData,
            common_mistakes: englishMistakes.slice(0, 6).map((m) => ({
              prompt: m.prompt,
              correction: m.correction,
            })),
          },
          temperature: 0.6,
        });
        const data = resp.data;
        if (data && (data.insight || data.recommendations)) {
          setInsight(data);
        } else {
          setInsight({ insight: resp.content });
        }
      } catch {
        setInsight({
          insight:
            'Keep practicing consistently. Even 10 minutes a day of English conversation will compound into noticeable fluency gains over a few weeks.',
          recommendations: [
            'Try a Daily Conversation session on a new topic',
            'Review your saved mistakes once a week',
            'Mix grammar drills with free speaking for balance',
          ],
        });
      } finally {
        setInsightLoading(false);
      }
    })();
  }, [englishSessions, completedSessions, categoryData, englishMistakes, avgScore, streak, profile, insight, insightLoading]);

  if (loading) {
    return (
      <AppLayout>
        <PageHeader
          title="English Report"
          description="Track your English practice progress, scores, and AI insights."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <LoadingState message="Loading your English report..." />
      </AppLayout>
    );
  }

  if (englishSessions.length === 0 && englishScores.length === 0) {
    return (
      <AppLayout>
        <PageHeader
          title="English Report"
          description="Track your English practice progress, scores, and AI insights."
          icon={<BarChart3 className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/english')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          }
        />
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" />}
          title="No English practice yet"
          description="Start a conversation, grammar drill, or vocabulary session to see your progress here."
          action={<Button onClick={() => navigate('/app/english/conversation')} leftIcon={<Mic className="h-4 w-4" />}>Start practicing</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="English Report"
        description="Track your English practice progress, scores, and AI insights."
        icon={<BarChart3 className="h-5 w-5" />}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/english')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Mic} label="Sessions" value={String(englishSessions.length)} color="text-brand-500" />
        <StatCard icon={Clock} label="Minutes" value={String(totalMinutes)} color="text-accent-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={Flame} label="Day streak" value={String(streak)} color="text-warning-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score trend */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-main">Score trend</h3>
              </div>
              {completedSessions.length > 0 && (
                <Badge variant={avgScore >= 80 ? 'success' : avgScore >= 60 ? 'warning' : 'error'}>
                  avg {avgScore}
                </Badge>
              )}
            </div>
            {trendData.length > 0 ? (
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <LineTrend data={trendData} color="#3b82f6" height={200} />
              </div>
            ) : (
              <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No scored sessions yet" description="Complete a session to see your score trend." />
            )}
          </Card>

          {/* Category breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-accent-500" />
              <h3 className="font-display font-semibold text-main">Sessions by category</h3>
            </div>
            {categoryData.length > 0 ? (
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <BarCompare data={categoryData} color="#06b6d4" height={220} />
              </div>
            ) : (
              <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No data yet" />
            )}
          </Card>

          {/* Skill mastery radar */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-success-500" />
              <h3 className="font-display font-semibold text-main">Skill mastery</h3>
            </div>
            {skillBreakdown.length >= 3 ? (
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <RadarSkills data={skillBreakdown} height={280} />
              </div>
            ) : (
              <EmptyState
                icon={<Target className="h-8 w-8" />}
                title="Not enough skill data"
                description="Practice across more English categories to build a full skill radar."
              />
            )}
          </Card>

          {/* Recent sessions */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-main">Recent sessions</h3>
              <Badge variant="default">{englishSessions.length} total</Badge>
            </div>
            {englishSessions.length === 0 ? (
              <EmptyState icon={<Mic className="h-8 w-8" />} title="No sessions yet" />
            ) : (
              <div className="space-y-2">
                {englishSessions.slice(0, 6).map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Mastery donut */}
          {masteryDonut.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-brand-500" />
                <h3 className="font-display font-semibold text-main">Mastery breakdown</h3>
              </div>
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <DonutChart data={masteryDonut} height={220} />
              </div>
              <div className="mt-3 space-y-1.5">
                {masteryDonut.map((d, i) => (
                  <div key={d.label} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][i % 5] }}
                    />
                    <span className="text-muted flex-1">{d.label}</span>
                    <span className="font-semibold text-main">{d.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI insight */}
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-main">AI insight</h3>
              </div>
              {insightLoading ? (
                <LoadingState message="Analyzing your progress..." />
              ) : insight ? (
                <div className="space-y-3">
                  <p className="text-sm text-main leading-relaxed">{insight.insight}</p>
                  {insight.highlights && insight.highlights.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Highlights</p>
                      <ul className="space-y-1.5">
                        {insight.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 text-sm text-main">
                            <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recommendations</p>
                      <ul className="space-y-1.5">
                        {insight.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm text-main">
                            <Lightbulb className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Insight will appear once you have practice data.</p>
              )}
            </div>
          </Card>

          {/* Common mistakes */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning-500" />
                <h3 className="font-display font-semibold text-main">Common mistakes</h3>
              </div>
              <Badge variant="warning">{englishMistakes.length}</Badge>
            </div>
            {mistakesLoading ? (
              <LoadingState message="Loading mistakes..." />
            ) : englishMistakes.length === 0 ? (
              <EmptyState
                icon={<Brain className="h-8 w-8" />}
                title="No mistakes saved"
                description="During grammar practice, save corrections to build your mistake journal."
                action={<Button size="sm" onClick={() => navigate('/app/english/grammar')} leftIcon={<Brain className="h-4 w-4" />}>Practice grammar</Button>}
              />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto code-scroll pr-1">
                {englishMistakes.slice(0, 8).map((m) => (
                  <div key={m.id} className="rounded-xl surface-2 p-3">
                    {m.prompt && <p className="text-xs text-muted mb-1">{m.prompt}</p>}
                    {m.user_answer && (
                      <p className="text-sm text-error-600 dark:text-error-400 line-through">{m.user_answer}</p>
                    )}
                    {m.correction && (
                      <p className="text-sm text-success-600 dark:text-success-400 mt-1">{m.correction}</p>
                    )}
                    <p className="text-[11px] text-muted mt-1.5">{timeAgo(m.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
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

function SessionRow({ session }: { session: PracticeSession }) {
  const categoryLabel = (session.category ?? 'session').replace(/_/g, ' ');
  const score = session.score;
  return (
    <div className="flex items-center gap-3 rounded-xl surface-2 p-3">
      <div className="h-9 w-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
        <Mic className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-main truncate">{session.title ?? `${categoryLabel} session`}</p>
        <p className="text-xs text-muted flex flex-wrap items-center gap-1.5">
          <span className="capitalize">{categoryLabel}</span>
          <span>·</span>
          <span>{timeAgo(session.started_at)}</span>
          <span>·</span>
          <span>{formatTime(session.duration_seconds)}</span>
        </p>
      </div>
      {score !== null ? (
        <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}>{score}</Badge>
      ) : (
        <Badge variant="default">{session.status === 'completed' ? 'done' : session.status}</Badge>
      )}
    </div>
  );
}
