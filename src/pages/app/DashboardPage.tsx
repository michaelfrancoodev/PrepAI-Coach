
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  TrendingUp,
  Target,
  BookOpen,
  Mic,
  Users,
  Code2,
  Network,
  ArrowRight,
  Sparkles,
  Calendar,
  Bot,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { AreaTrend } from '@/components/ui/Charts';
import { useAuth } from '@/context/AuthContext';
import type { MasteryTrack } from '@/lib/types';

const TRACK_LIST: MasteryTrack[] = ['english', 'coding', 'interview'];
const TRACK_META: Record<MasteryTrack, { label: string; icon: typeof Mic; path: string }> = {
  english: { label: 'English', icon: Mic, path: '/app/english' },
  coding: { label: 'Coding', icon: Code2, path: '/app/interviews' },
  interview: { label: 'Interviews', icon: Users, path: '/app/interviews' },
};
import { useSessions, useSkillScores, useMastery, useWordOfTheDay } from '@/hooks/useData';
import { cn, timeAgo, formatTime } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(10);
  const { scores } = useSkillScores();
  const { dailyPlan, loading: masteryLoading } = useMastery();
  const { word: wordOfDay } = useWordOfTheDay();

  const plan = dailyPlan();
  const dueReviewCount = TRACK_LIST.reduce((sum, t) => sum + plan.perTrack[t].dueReviews.length, 0);

  // Today's concrete task list — ONE item per track, straight from the
  // Mastery Engine (a due review if one exists, otherwise the next new
  // topic). This is the single source of truth for "what to do today" —
  // there is no separate, disconnected AI-generated mission anymore.
  const todaysTasks = TRACK_LIST.map((track) => {
    const t = plan.perTrack[track];
    const item = t.dueReviews[0] ?? t.nextNewTopic;
    if (!item) return null;
    return {
      track,
      kind: t.dueReviews[0] ? ('review' as const) : ('learn' as const),
      topic: item,
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / completedSessions.length)
    : 0;

  const weekData = (() => {
    const days: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const daySessions = sessions.filter((s) => {
        const sd = new Date(s.started_at);
        return sd.toDateString() === d.toDateString();
      });
      days.push({ label: dayLabel, value: daySessions.length });
    }
    return days;
  })();


  /* Determine current learning step */
  const totalSessions = sessions.length;
  const currentStep = (() => {
    if (totalSessions === 0) return { step: 1, label: 'Start your first practice', desc: 'Pick any category below and try a short session to get your baseline score.', path: '/app/interviews' };
    if (totalSessions < 5) return { step: 2, label: 'Build a habit', desc: 'Complete 5 practice sessions to unlock personalized analytics and skill tracking.', path: '/app/interviews' };
    if (totalSessions < 15) return { step: 3, label: 'Deepen your skills', desc: 'Focus on your weak areas shown below. Try harder difficulty levels.', path: '/app/interviews' };
    if (totalSessions < 30) return { step: 4, label: 'Refine and polish', desc: 'Do full mock interviews under realistic conditions. Aim for 80+ scores.', path: '/app/interviews' };
    return { step: 5, label: 'You are interview-ready', desc: 'Keep practicing to maintain sharpness. Try company-specific interviews.', path: '/app/interviews' };
  })();

  const quickActions = [
    { icon: Mic, label: 'English Speaking', path: '/app/english', desc: 'Conversation, grammar, vocabulary' },
    { icon: Users, label: 'Mock Interview', path: '/app/interviews', desc: 'HR, behavioral, technical rounds' },
    { icon: Code2, label: 'Coding Practice', path: '/app/interviews', desc: 'Verbal problem-solving, AI-graded, no code editor' },
    { icon: Network, label: 'System Design', path: '/app/system-design', desc: 'Scalable architecture design' },
  ];

  // The ONE next action for the hero button — the first task in today's
  // Mastery Engine plan, otherwise a sensible default based on overall
  // progress. This is what makes the dashboard a single clear "start here",
  // not a menu of equal choices, and it's the SAME data source that drives
  // the "Today's Plan" card below — no second, disconnected system.
  const firstTask = todaysTasks[0];
  const nextActionPath = firstTask ? `/app/learning/topic/${firstTask.topic.slug}` : currentStep.path;
  const nextActionLabel = firstTask
    ? `${firstTask.kind === 'review' ? 'Review' : 'Learn'}: ${firstTask.topic.title}`
    : currentStep.label;

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${profile?.display_name ?? 'Learner'}`}
        description="Here's your practice summary and today's plan. Keep the streak going!"
        icon={<Sparkles className="h-5 w-5" />}
        action={
          <Button onClick={() => navigate('/app/interviews')} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start practice
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Flame} label="Day streak" value={String(profile?.streak_count ?? 0)} color="text-warning-500" />
        <StatCard icon={Clock} label="Total minutes" value={String(totalMinutes)} color="text-primary" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={Target} label="Sessions" value={String(sessions.length)} color="text-accent-500" />
      </div>

      {/* Current step banner — THE single primary action on this page */}
      <Card className="mb-6 relative overflow-hidden border-primary/30">
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded border border-app surface-2 flex items-center justify-center shrink-0">
              <PlayCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="primary">Step {currentStep.step} of 5</Badge>
                <span className="text-xs text-muted uppercase tracking-wide">Today</span>
              </div>
              <p className="text-base font-display font-semibold text-main">{nextActionLabel}</p>
              <p className="text-sm text-muted">{currentStep.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className="flex-1 sm:flex-none"
              onClick={() => navigate(nextActionPath)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start now
            </Button>
            <button
              onClick={() => navigate('/app/coach')}
              className="text-xs text-muted hover:text-primary underline underline-offset-2 shrink-0"
            >
              Not sure? Ask coach
            </button>
          </div>
        </div>
      </Card>

      {/* Your Journey — 0 to 100, per track, with what's due today */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-main">Your Journey</h3>
            <p className="text-xs text-muted">
              Overall mastery: {plan.overallMastery}/100
              {dueReviewCount > 0 && ` · ${dueReviewCount} review${dueReviewCount > 1 ? 's' : ''} due today`}
            </p>
          </div>
        </div>
        {masteryLoading ? (
          <p className="text-sm text-muted">Loading your progress...</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {TRACK_LIST.map((track) => {
              const t = plan.perTrack[track];
              const meta = TRACK_META[track];
              const target = t.dueReviews[0] ?? t.nextNewTopic;
              return (
                <button
                  key={track}
                  onClick={() => navigate(target ? `/app/learning/topic/${target.slug}` : meta.path)}
                  className="text-left rounded-xl border border-app surface p-3.5 hover:surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <meta.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-main">{meta.label}</span>
                    <Badge variant="default" className="ml-auto capitalize !text-[10px]">{t.level}</Badge>
                  </div>
                  <Progress value={t.levelProgressPct} size="sm" className="mb-2" />
                  <p className="text-xs text-muted line-clamp-2">
                    {t.dueReviews.length > 0
                      ? `Review due: ${target?.title}`
                      : target
                        ? `Next up: ${target.title}`
                        : 'Level complete — great work!'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {wordOfDay && (
        <Card className="mb-6 !p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded border border-app surface-2 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted uppercase tracking-wide">Word of the day</span>
                <Badge variant="default" className="capitalize !text-[10px]">{wordOfDay.category}</Badge>
              </div>
              <p className="text-sm font-semibold text-main mt-0.5">{wordOfDay.word}</p>
              <p className="text-sm text-muted mt-0.5">{wordOfDay.meaning}</p>
              <p className="text-xs text-muted italic mt-1">"{wordOfDay.example}"</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Plan — SAME data source as the hero button and Your Journey above. One list, one source of truth, no duplicate/disconnected AI-generated mission. */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded border border-app surface-2 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-main">Today's Plan</h3>
                  <p className="text-xs text-muted">{todaysTasks.length} item{todaysTasks.length === 1 ? '' : 's'} · from your mastery progress</p>
                </div>
              </div>
            </div>
            {masteryLoading ? (
              <LoadingState message="Loading your plan..." />
            ) : todaysTasks.length > 0 ? (
              <div className="space-y-2">
                {todaysTasks.map(({ track, kind, topic }) => {
                  const meta = TRACK_META[track];
                  return (
                    <div
                      key={topic.id}
                      className="flex items-start gap-3 w-full text-left rounded-xl border border-app surface hover:surface-2 p-3 transition-all"
                    >
                      <div className="shrink-0 mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <meta.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-main">{topic.title}</p>
                        <p className="text-xs text-muted mt-0.5">{topic.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant={kind === 'review' ? 'warning' : 'primary'}>
                            {kind === 'review' ? 'Review due' : 'New topic'}
                          </Badge>
                          <Badge variant="default" className="capitalize">{meta.label}</Badge>
                          <button
                            onClick={() => navigate(`/app/learning/topic/${topic.slug}`)}
                            className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline ml-auto"
                          >
                            Start <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Target className="h-10 w-10" />}
                title="All caught up!"
                description="No reviews or new topics due right now. Check back tomorrow, or explore a track below."
              />
            )}
          </Card>

          {/* Quick start */}
          <div>
            <h3 className="font-display font-semibold text-main mb-3">Quick start — pick a practice type</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="card p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="h-9 w-9 rounded border border-app surface-2 flex items-center justify-center mb-3">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-main">{a.label}</p>
                  <p className="text-xs text-muted mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <Card>
            <h3 className="font-display font-semibold text-main mb-4">This week's activity</h3>
            <div className="overflow-x-auto">
              <AreaTrend data={weekData} height={180} />
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent sessions */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-main">Recent practice</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')}>All</Button>
            </div>
            {loading ? (
              <LoadingState message="Loading sessions..." />
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="No sessions yet"
                description="Start your first practice session to see it here."
                action={<Button size="sm" onClick={() => navigate('/app/interviews')}>Start now</Button>}
              />
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      s.type === 'english' ? 'bg-brand-500/10 text-brand-500' :
                      s.type === 'coding' ? 'bg-success-500/10 text-success-500' :
                      s.type === 'interview' ? 'bg-accent-500/10 text-accent-500' :
                      'bg-warning-500/10 text-warning-500'
                    )}>
                      {s.type === 'english' ? <Mic className="h-4 w-4" /> : s.type === 'coding' ? <Code2 className="h-4 w-4" /> : s.type === 'interview' ? <Users className="h-4 w-4" /> : <Network className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{s.title ?? `${s.category} session`}</p>
                      <p className="text-xs text-muted">{timeAgo(s.started_at)} · {formatTime(s.duration_seconds)}</p>
                    </div>
                    {s.score !== null && (
                      <Badge variant={s.score >= 80 ? 'success' : s.score >= 60 ? 'warning' : 'error'} className="shrink-0">
                        {s.score}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Skill snapshot */}
          {scores.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-main">Skill snapshot</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')}>Details</Button>
              </div>
              {(() => {
                const latestBySkill = new Map<string, number>();
                for (const s of scores) latestBySkill.set(s.skill, s.score);
                const sorted = [...latestBySkill.entries()].sort((a, b) => a[1] - b[1]).slice(0, 4);
                return (
                  <div className="space-y-3">
                    {sorted.map(([skill, score]) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-main capitalize">{skill.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-muted">{score}/100</span>
                        </div>
                        <Progress value={score} color={score >= 70 ? 'success' : 'warning'} size="sm" />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* AI Coach CTA */}
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded border border-app surface-2 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-main">Ask your AI Coach</h3>
              </div>
              <p className="text-sm text-muted mb-4">Not sure what to practice? Ask for a personalized recommendation.</p>
              <Button className="w-full" onClick={() => navigate('/app/coach/ask')} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Chat with coach
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix }: { icon: typeof Flame; label: string; value: string; color: string; suffix?: string }) {
  return (
    <Card className="!p-4 sm:!p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="font-display text-xl sm:text-2xl font-bold text-main">
        {value}<span className="text-sm text-muted font-normal">{suffix}</span>
      </p>
    </Card>
  );
}
