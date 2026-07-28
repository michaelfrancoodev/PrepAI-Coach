import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import {
  Map,
  Target,
  TrendingUp,
  Rocket,
  Check,
  ArrowRight,
  Bot,
  RefreshCw,
  Compass,
  Flag,
  CalendarDays,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

interface Phase {
  id: string;
  name: string;
  tagline: string;
  icon: typeof Map;
  weeks: string;
  accent: string;
  tint: string;
  goals: string[];
  skills: string[];
  milestone: string;
}

const phases: Phase[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    tagline: 'Build the base',
    icon: Target,
    weeks: 'Weeks 1–3',
    accent: 'surface-2 border border-app',
    tint: 'text-brand-600 dark:text-brand-300',
    goals: [
      'Establish a consistent daily practice habit',
      'Diagnose current English and coding levels',
      'Fix the most common grammar & pronunciation gaps',
    ],
    skills: ['Basic conversation', 'Present tense mastery', 'Arrays & strings', 'Hash maps'],
    milestone: 'Complete first 10 sessions with a 3-day streak',
  },
  {
    id: 'building',
    name: 'Building',
    tagline: 'Grow core skills',
    icon: TrendingUp,
    weeks: 'Weeks 4–6',
    accent: 'surface-2 border border-app',
    tint: 'text-accent-600 dark:text-accent-300',
    goals: [
      'Expand vocabulary and improve fluency pacing',
      'Tackle intermediate coding patterns with confidence',
      'Start behavioral interview storytelling (STAR method)',
    ],
    skills: ['Interview English', 'Sliding window', 'Trees & recursion', 'STAR stories'],
    milestone: 'Pass a full behavioral mock interview',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Raise the bar',
    icon: Rocket,
    weeks: 'Weeks 7–9',
    accent: 'surface-2 border border-app',
    tint: 'text-success-600 dark:text-success-400',
    goals: [
      'Handle complex technical and domain interviews',
      'Design scalable systems under time pressure',
      'Sharpen pronunciation and reduce filler words',
    ],
    skills: ['Graphs & DP', 'System design basics', 'Technical Q&A depth', 'Advanced fluency'],
    milestone: 'Solve a medium-hard coding problem in under 25 minutes',
  },
  {
    id: 'interview-ready',
    name: 'Interview Ready',
    tagline: 'Lock it in',
    icon: Flag,
    weeks: 'Weeks 10–12',
    accent: 'surface-2 border border-app',
    tint: 'text-brand-600 dark:text-brand-300',
    goals: [
      'Run full company-specific mock interview loops',
      'Polish delivery, confidence, and recovery from mistakes',
      'Consolidate weak areas into strengths',
    ],
    skills: ['Company mocks', 'System design at scale', 'Pressure recovery', 'Offer negotiation English'],
    milestone: 'Score 80+ on a full company-specific mock loop',
  },
];

interface WeekItem {
  week: number;
  focus: string;
  tasks: string[];
  phase: string;
}

const timeline: WeekItem[] = [
  { week: 1, focus: 'Assessment & habit', phase: 'Foundation', tasks: ['Take full AI assessment', 'Daily 15-min English conversation', 'Arrays basics'] },
  { week: 2, focus: 'Grammar fundamentals', phase: 'Foundation', tasks: ['Tense correction drills', 'Pronunciation phoneme scoring', 'Hash maps & sets'] },
  { week: 3, focus: 'First coding patterns', phase: 'Foundation', tasks: ['Two pointers & sliding window', 'Vocabulary builder start', 'First HR mock'] },
  { week: 4, focus: 'Fluency & trees', phase: 'Building', tasks: ['Fluency pacing drills', 'Tree traversal patterns', 'Behavioral STAR intro'] },
  { week: 5, focus: 'Interview English', phase: 'Building', tasks: ['Storytelling under pressure', 'Stacks & queues', 'Listening comprehension'] },
  { week: 6, focus: 'Behavioral depth', phase: 'Building', tasks: ['Full behavioral mock', 'Linked list patterns', 'Reduce filler words'] },
  { week: 7, focus: 'Graphs & DP', phase: 'Advanced', tasks: ['BFS / DFS foundations', '1D dynamic programming', 'Technical Q&A: backend'] },
  { week: 8, focus: 'System design I', phase: 'Advanced', tasks: ['URL shortener design', 'Trade-off articulation', 'Advanced pronunciation'] },
  { week: 9, focus: 'System design II', phase: 'Advanced', tasks: ['Chat system design', '2D DP problems', 'Technical Q&A: frontend'] },
  { week: 10, focus: 'Company mocks', phase: 'Interview Ready', tasks: ['FAANG-style coding round', 'Company behavioral mock', 'Offer negotiation English'] },
  { week: 11, focus: 'Full loops', phase: 'Interview Ready', tasks: ['End-to-end mock loop', 'System design at scale', 'Pressure recovery drills'] },
  { week: 12, focus: 'Polish & land it', phase: 'Interview Ready', tasks: ['Final company-specific loop', 'Weak-area consolidation', 'Confidence review'] },
];

const adaptReasons = [
  { icon: RefreshCw, title: 'Rebalances automatically', desc: 'Master a skill early? The coach moves it down the priority queue and pulls forward the next milestone.' },
  { icon: Bot, title: 'Targets weak areas', desc: 'Struggling with DP? The roadmap inserts extra DP reps and pushes back less-critical topics.' },
  { icon: CalendarDays, title: 'Fits your schedule', desc: 'Have 15 minutes a day? The plan shrinks missions. Got a month off? It compresses into an intensive track.' },
  { icon: Compass, title: 'Tuned to your goal', desc: 'Targeting a backend role at a unicorn? The roadmap weights system design and backend depth over frontend drills.' },
];

export function RoadmapPage() {
  useDocumentTitle('AI Roadmap');
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Your personalized path to job-ready</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              A roadmap that
              <br />
              <span className="gradient-text">adapts to you</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              No generic checklists. PrepAI builds a living, week-by-week plan from your assessment, target role,
              and schedule — then reshuffles itself as you grow.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                {user ? 'Go to Dashboard' : 'Get my roadmap'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/features')}>
                Explore features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Phases overview */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="primary" className="mb-4">Four phases</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">From foundation to offer</h2>
            <p className="mt-4 text-muted">Every roadmap moves through four phases. What changes is the pace and the weighting — tuned to you.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {phases.map((phase, idx) => (
              <Card key={phase.id} hover className="group relative h-full flex flex-col">
                {/* Phase number watermark */}
                <span className="absolute right-4 top-3 font-display text-5xl font-extrabold opacity-10 text-main">
                  {idx + 1}
                </span>
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-primary mb-4', phase.accent)}>
                  <phase.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold text-main">{phase.name}</h3>
                </div>
                <p className={cn('text-xs font-semibold uppercase tracking-wide', phase.tint)}>{phase.weeks}</p>
                <p className="mt-1 text-sm text-muted">{phase.tagline}</p>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-main uppercase tracking-wide mb-2">Goals</p>
                  <ul className="space-y-1.5">
                    {phase.goals.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-sm text-muted">
                        <Check className="h-3.5 w-3.5 text-success-500 mt-0.5 shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-main uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.skills.map((s) => (
                      <span key={s} className="chip text-xs">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-app">
                  <p className="text-xs font-semibold text-main uppercase tracking-wide mb-1">Milestone</p>
                  <p className="text-sm text-muted">{phase.milestone}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 12-week timeline */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="accent" className="mb-4">Sample 12-week roadmap</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">A week-by-week look</h2>
            <p className="mt-4 text-muted">
              This is a representative plan for a career switcher targeting a backend role with 30 minutes a day. Yours
              will differ — and that is the point.
            </p>
          </div>

          {/* Phase legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {phases.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className={cn('h-3 w-3 rounded-full', p.accent)} />
                <span className="text-muted">{p.name}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            {/* Horizontal connector for large screens */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/40 via-accent-500/40 to-success-500/40" aria-hidden />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {timeline.map((w, idx) => {
                const phase = phases.find((p) => p.name === w.phase);
                return (
                  <Card
                    key={w.week}
                    hover
                    className="relative animate-slide-up"
                    style={{ animationDelay: `${idx * 0.03}s` } as CSSProperties}
                  >
                    {/* Week dot */}
                    <div className="absolute -top-3 left-6 z-10">
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-primary', phase?.accent)}>
                        {w.week}
                      </span>
                    </div>
                    <div className="pt-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-muted">Week {w.week}</span>
                        <span className={cn('chip text-xs', phase?.tint)}>{w.phase}</span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-main">{w.focus}</h3>
                      <ul className="mt-3 space-y-1.5">
                        {w.tasks.map((t) => (
                          <li key={t} className="flex items-start gap-2 text-xs text-muted">
                            <Check className="h-3.5 w-3.5 text-success-500 mt-0.5 shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it adapts */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="success" className="mb-4">Always adapting</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Why the roadmap stays relevant</h2>
            <p className="mt-4 text-muted">A static plan goes stale in a week. PrepAI keeps yours alive.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {adaptReasons.map((r) => (
              <Card key={r.title} hover className="group text-center h-full">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-semibold text-main">{r.title}</h3>
                <p className="mt-2 text-sm text-muted">{r.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-16 text-center">
            <div className="relative">
              <Map className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Get your roadmap in 10 minutes</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Take the assessment and your AI coach will generate a personalized, adaptive plan you can start today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {user ? 'Go to Dashboard' : 'Get started free'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>
                  View pricing
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}


