import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Cpu,
  Code2,
  Layout,
  Server,
  Layers,
  Cloud,
  Network,
  Briefcase,
  Database,
  Brain,
  Building2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { useSessions } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo, formatTime } from '@/lib/utils';

interface InterviewTypeMeta {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const INTERVIEW_TYPES: InterviewTypeMeta[] = [
  {
    slug: 'hr',
    title: 'HR Interview',
    description: 'General HR questions, background, and culture fit.',
    icon: Users,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'behavioral',
    title: 'Behavioral',
    description: 'STAR-method questions on past experiences.',
    icon: MessageSquare,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'technical',
    title: 'Technical',
    description: 'Core CS concepts, languages, and fundamentals.',
    icon: Cpu,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'coding',
    title: 'Coding',
    description: 'Live problem-solving with algorithms & data structures.',
    icon: Code2,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'frontend',
    title: 'Frontend',
    description: 'React, CSS, performance, and UI engineering.',
    icon: Layout,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'backend',
    title: 'Backend',
    description: 'APIs, databases, concurrency, and server design.',
    icon: Server,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'fullstack',
    title: 'Full Stack',
    description: 'End-to-end system questions across the stack.',
    icon: Layers,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'devops',
    title: 'DevOps',
    description: 'CI/CD, containers, cloud infra, and observability.',
    icon: Cloud,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'system-design',
    title: 'System Design',
    description: 'Scalable architecture, trade-offs, and capacity planning.',
    icon: Network,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    description: 'Product sense, metrics, prioritization, and strategy.',
    icon: Briefcase,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'data-science',
    title: 'Data Science',
    description: 'Statistics, ML concepts, and data pipelines.',
    icon: Database,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'ai-ml',
    title: 'AI/ML',
    description: 'Model design, training, evaluation, and deployment.',
    icon: Brain,
    gradient: 'surface-2 border border-app',
  },
  {
    slug: 'company',
    title: 'Company Interview',
    description: 'Targeted prep for FAANG and top tech companies.',
    icon: Building2,
    gradient: 'surface-2 border border-app',
  },
];

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

function scoreBadgeVariant(score: number | null): 'success' | 'warning' | 'error' | 'default' {
  if (score === null) return 'default';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}

export function InterviewHomePage() {
  useDocumentTitle('Interview Practice');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(50);

  const interviewSessions = sessions.filter((s) => s.type === 'interview');
  const completed = interviewSessions.filter((s) => s.status === 'completed');
  const total = interviewSessions.length;
  const avgScore = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.score ?? 0), 0) / completed.length)
    : 0;
  const bestScore = completed.length
    ? Math.max(...completed.map((s) => s.score ?? 0))
    : 0;

  const recent = interviewSessions.slice(0, 5);

  const recommended: InterviewTypeMeta =
    INTERVIEW_TYPES.find((t) => t.slug === 'behavioral') ?? INTERVIEW_TYPES[0];

  return (
    <AppLayout>
      <PageHeader
        title="Interview Practice"
        description="Sharpen your skills with AI-powered mock interviews across 13 categories — from HR to system design."
        icon={<Users className="h-5 w-5" />}
        action={
          <Button
            onClick={() => navigate(`/app/interviews/${recommended.slug}`)}
            leftIcon={<Sparkles className="h-4 w-4" />}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start a mock interview
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Target} label="Total interviews" value={String(total)} color="text-accent-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completed.length)} color="text-brand-500" />
        <StatCard icon={Award} label="Best score" value={`${bestScore}`} color="text-warning-500" suffix="/100" />
      </div>

      {/* Interview type grid */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-semibold text-main mb-4">Choose an interview type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {INTERVIEW_TYPES.map((t) => (
            <button
              key={t.slug}
              onClick={() => navigate(`/app/interviews/${t.slug}`)}
              className="group card p-5 text-left hover:shadow-md transition-all duration-300 animate-fade-in"
            >
              <div
                className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center mb-4',
                  t.gradient,
                )}
              >
                <t.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-main mb-1">{t.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{t.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Start now
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent interviews */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-main">Recent interviews</h3>
                  <p className="text-xs text-muted">Your last 5 practice sessions</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate('/app/interviews/results')}>
                View all
              </Button>
            </div>

            {loading ? (
              <LoadingState message="Loading sessions..." />
            ) : recent.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="No interviews yet"
                description="Start your first mock interview to see your progress here."
                action={
                  <Button size="sm" onClick={() => navigate(`/app/interviews/${recommended.slug}`)}>
                    Start now
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {recent.map((s) => {
                  const meta = INTERVIEW_TYPES.find((t) => t.slug === s.category);
                  const Icon = meta?.icon ?? Users;
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/app/interviews/${s.category}`)}
                      className="flex items-center gap-3 w-full text-left rounded-xl surface-2 p-3 hover:surface transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-main truncate">
                          {s.title ?? meta?.title ?? `${s.category} interview`}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                          <span>{timeAgo(s.started_at)}</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {formatTime(s.duration_seconds)}
                          </span>
                        </p>
                      </div>
                      {s.score !== null ? (
                        <Badge variant={scoreBadgeVariant(s.score)}>{s.score}</Badge>
                      ) : (
                        <Badge variant="default">In progress</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recommended for you */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-main">Recommended for you</h3>
              </div>
              <p className="text-sm text-muted mb-4">
                {profile?.target_role
                  ? `Based on your target role of ${profile.target_role}, we suggest a behavioral interview to practice articulating your experience.`
                  : 'Practice articulating your past experiences with the STAR method — a behavioral interview is a great place to start.'}
              </p>
              <div className="rounded-xl surface-2 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                      recommended.gradient,
                    )}
                  >
                    <recommended.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-main">{recommended.title}</p>
                    <p className="text-xs text-muted">{recommended.description}</p>
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(`/app/interviews/${recommended.slug}`)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start a mock interview
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold text-main mb-3">Quick stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Categories practiced</span>
                <Badge variant="accent">
                  {new Set(interviewSessions.map((s) => s.category)).size} / {INTERVIEW_TYPES.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Completion rate</span>
                <span className="text-sm font-semibold text-main">
                  {total > 0 ? Math.round((completed.length / total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total practice time</span>
                <span className="text-sm font-semibold text-main flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  {formatTime(interviewSessions.reduce((acc, s) => acc + s.duration_seconds, 0))}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
