import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Target,
  TrendingUp,
  TrendingDown,
  Heart,
  ArrowRight,
  MessageSquare,
  Calendar,
  Brain,
  Circle,
  Lightbulb,
  Award,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, LoadingState, Spinner } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { useSkillScores } from '@/hooks/useData';
import { callAi } from '@/lib/ai';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* AI response shapes                                                 */
/* ------------------------------------------------------------------ */

interface PlanWeek {
  week: number;
  focus: string;
  tasks: { day: string; task: string; type: string }[];
}
interface CoachPlan {
  title: string;
  description: string;
  weeks: PlanWeek[];
}
interface CoachMotivation {
  message: string;
  quote?: string;
}

/* ------------------------------------------------------------------ */
/* Quick links                                                        */
/* ------------------------------------------------------------------ */

const QUICK_LINKS = [
  { icon: MessageSquare, label: 'Ask AI', path: '/app/coach/ask', color: 'surface-2 border border-app' },
  { icon: Calendar, label: 'Practice Planner', path: '/app/learning', color: 'surface-2 border border-app' },
  { icon: Brain, label: 'AI Memory', path: '/app/settings', color: 'surface-2 border border-app' },
];

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function CoachHomePage() {
  useDocumentTitle('AI Coach');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { scores } = useSkillScores();

  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [motivation, setMotivation] = useState<CoachMotivation | null>(null);
  const [motivationLoading, setMotivationLoading] = useState(true);

  /* Generate plan on mount */
  useEffect(() => {
    let active = true;
    setPlanLoading(true);
    (async () => {
      try {
        const resp = await callAi<CoachPlan>({
          mode: 'coach_plan',
          context: {
            experience_level: profile?.experience_level,
            goals: profile?.goals,
            target_companies: profile?.preferred_companies,
            target_role: profile?.target_role,
            skill_scores: scores.slice(-10).map((s) => ({ skill: s.skill, score: s.score })),
          },
          temperature: 0.6,
        });
        if (active) setPlan(resp.data ?? null);
      } catch {
        if (active) setPlan(null);
      } finally {
        if (active) setPlanLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Generate motivation on mount */
  useEffect(() => {
    let active = true;
    setMotivationLoading(true);
    (async () => {
      try {
        const resp = await callAi<CoachMotivation>({
          mode: 'coach_motivation',
          context: {
            display_name: profile?.display_name,
            streak_count: profile?.streak_count,
            goals: profile?.goals,
            target_role: profile?.target_role,
          },
          temperature: 0.8,
        });
        if (active) setMotivation(resp.data ?? null);
      } catch {
        if (active) setMotivation(null);
      } finally {
        if (active) setMotivationLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Weak / strong skills (latest score per skill) */
  const latestBySkill = new Map<string, number>();
  for (const s of scores) {
    latestBySkill.set(s.skill, s.score);
  }
  const skillEntries = [...latestBySkill.entries()].map(([skill, score]) => ({ skill, score }));
  const weakAreas = [...skillEntries].sort((a, b) => a.score - b.score).slice(0, 4);
  const strengths = [...skillEntries].sort((a, b) => b.score - a.score).slice(0, 4);

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there';

  return (
    <AppLayout>
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl mb-6 animate-fade-in">
        <div className="relative card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar name={profile?.display_name} src={profile?.avatar_url} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wide">Your AI Coach</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-main">
                Hi {firstName}, let's level up today
              </h1>
              <p className="text-sm text-muted mt-1 max-w-xl">
                I've analyzed your progress and put together a personalized plan. Stay consistent and your streak will keep climbing.
              </p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => navigate('/app/coach/ask')} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Ask me anything
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: plan + links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personalized Plan */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-main">Your Personalized Plan</h3>
                  <p className="text-xs text-muted">AI-tailored to your goals and current skill level</p>
                </div>
              </div>
              {plan && <Badge variant="primary">{plan.weeks.length} weeks</Badge>}
            </div>

            {planLoading ? (
              <LoadingState message="Generating your personalized plan..." />
            ) : plan ? (
              <div className="space-y-4">
                <div className="rounded-xl surface-2 p-3">
                  <p className="text-sm font-medium text-main">{plan.title}</p>
                  <p className="text-xs text-muted mt-1">{plan.description}</p>
                </div>
                <div className="space-y-3">
                  {plan.weeks.map((w) => (
                    <div key={w.week} className="rounded-xl border border-app p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {w.week}
                        </div>
                        <span className="text-sm font-medium text-main">Week {w.week}</span>
                        <Badge variant="accent" className="ml-auto">{w.tasks.length} tasks</Badge>
                      </div>
                      <p className="text-xs text-muted mb-2">{w.focus}</p>
                      <div className="space-y-1.5">
                        {w.tasks.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Circle className="h-3 w-3 text-muted shrink-0" />
                            <span className="text-muted shrink-0">{t.day}:</span>
                            <span className="text-main flex-1 min-w-0">{t.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Target className="h-8 w-8" />}
                title="Couldn't generate your plan"
                description="Please try again in a moment. Your coach will build a weekly plan from your goals and scores."
                action={<Button size="sm" onClick={() => window.location.reload()}>Retry</Button>}
              />
            )}
          </Card>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-main mb-3">Quick links</h3>
            <div className="grid grid-cols-3 gap-3">
              {QUICK_LINKS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => navigate(q.path)}
                  className="group card p-4 text-center transition-all"
                >
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3', q.color)}>
                    <q.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-main">{q.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: weak areas, strengths, motivation */}
        <div className="space-y-6">
          {/* Weak areas */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-warning-500" />
              <h3 className="font-display font-semibold text-main">Weak Areas</h3>
            </div>
            {weakAreas.length === 0 ? (
              <EmptyState icon={<Target className="h-8 w-8" />} title="No data yet" description="Complete practice sessions to reveal your weak areas." />
            ) : (
              <div className="space-y-3">
                {weakAreas.map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-main capitalize">{s.skill.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted">{s.score}/100</span>
                    </div>
                    <Progress value={s.score} color="warning" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Strengths */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success-500" />
              <h3 className="font-display font-semibold text-main">Strengths</h3>
            </div>
            {strengths.length === 0 ? (
              <EmptyState icon={<Award className="h-8 w-8" />} title="No data yet" description="Your top skills will appear here once you start practicing." />
            ) : (
              <div className="space-y-3">
                {strengths.map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-main capitalize">{s.skill.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted">{s.score}/100</span>
                    </div>
                    <Progress value={s.score} color="success" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Daily motivation */}
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-accent-500" />
                <h3 className="font-display font-semibold text-main">Daily Motivation</h3>
              </div>
              {motivationLoading ? (
                <div className="flex items-center gap-2 py-6">
                  <Spinner size="sm" />
                  <span className="text-sm text-muted">Finding the right words...</span>
                </div>
              ) : motivation ? (
                <div>
                  <p className="text-sm text-main leading-relaxed">{motivation.message}</p>
                  {motivation.quote && (
                    <div className="mt-3 rounded-xl surface-2 p-3">
                      <p className="text-xs text-muted italic flex items-start gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-accent-500 shrink-0 mt-0.5" />
                        "{motivation.quote}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted">Keep going — every session counts. Your future self will thank you.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
