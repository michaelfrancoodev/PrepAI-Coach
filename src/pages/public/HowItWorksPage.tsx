import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Map,
  Mic,
  Brain,
  BarChart3,
  Trophy,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Users,
  Code2,
  Network,
  Zap,
  Clock,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

interface Step {
  num: string;
  icon: typeof Mic;
  title: string;
  desc: string;
  details: string[];
  duration: string;
  accent: string;
}

const steps: Step[] = [
  {
    num: '01',
    icon: ClipboardCheck,
    title: 'Sign up & assess',
    desc: 'Create your free account and take a short AI assessment that maps your current English and coding level — no prep required.',
    details: ['English speaking & comprehension check', 'Coding fundamentals screening', 'Interview readiness snapshot'],
    duration: '~10 min',
    accent: 'surface-2 border border-app',
  },
  {
    num: '02',
    icon: Map,
    title: 'Get your AI roadmap',
    desc: 'The coach builds a personalized, week-by-week plan from your assessment, target role, and available time. It adapts as you progress.',
    details: ['Goals calibrated to your target companies', 'Weekly skill milestones', 'Auto-rebalances as you grow'],
    duration: 'Instant',
    accent: 'surface-2 border border-app',
  },
  {
    num: '03',
    icon: Mic,
    title: 'Practice daily',
    desc: 'Show up for a 15–30 minute mission. Speak in voice interviews, solve coding problems, and answer English prompts — all in realistic live sessions.',
    details: ['Voice interview simulations', 'Live coding with test cases', 'English conversation drills'],
    duration: '15–30 min / day',
    accent: 'surface-2 border border-app',
  },
  {
    num: '04',
    icon: Brain,
    title: 'Get instant feedback',
    desc: 'After every session the AI scores your grammar, pronunciation, coding, and problem-solving — with specific, actionable suggestions.',
    details: ['Grammar & pronunciation scores', 'Code complexity & correctness review', 'Behavioral answer structure feedback'],
    duration: 'Instant',
    accent: 'surface-2 border border-app',
  },
  {
    num: '05',
    icon: BarChart3,
    title: 'Track your progress',
    desc: 'Skill trees, confidence graphs, and streaks turn vague feelings into hard evidence. Spot plateaus before they stall you.',
    details: ['Skill tree with mastery levels', 'Confidence trends over time', 'Streaks & achievement badges'],
    duration: 'Ongoing',
    accent: 'surface-2 border border-app',
  },
  {
    num: '06',
    icon: Trophy,
    title: 'Land the job',
    desc: 'Walk into real interviews calm, articulate, and prepared. Users report sharper answers, stronger English, and dramatically less anxiety.',
    details: ['Company-specific mock rounds', 'Confidence under pressure', 'A clear story for every question'],
    duration: 'Your offer',
    accent: 'surface-2 border border-app',
  },
];

const comparison: { feature: string; nonecoach: boolean; traditional: boolean; notes: string }[] = [
  { feature: 'Available 24/7 on your schedule', nonecoach: true, traditional: false, notes: 'Practice at 2am if that is when you focus best.' },
  { feature: 'Live voice interview simulation', nonecoach: true, traditional: false, notes: 'Real spoken dialogue, not just typed chat.' },
  { feature: 'Personalized adaptive roadmap', nonecoach: true, traditional: false, notes: 'Reshuffles based on your actual progress.' },
  { feature: 'Instant, detailed feedback', nonecoach: true, traditional: false, notes: 'Every session scored in seconds.' },
  { feature: 'Remembers your weak areas', nonecoach: true, traditional: false, notes: 'The coach learns you over weeks, not minutes.' },
  { feature: 'Unlimited practice sessions', nonecoach: true, traditional: false, notes: 'Pro tier removes all daily caps.' },
  { feature: 'Human peer / paid tutor', nonecoach: false, traditional: true, notes: 'Valuable, but costly and hard to schedule.' },
  { feature: 'Free or low-cost', nonecoach: true, traditional: false, notes: 'Start free; Pro is a fraction of tutor pricing.' },
];

export function HowItWorksPage() {
  useDocumentTitle('How It Works');
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
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>From sign-up to offer in six steps</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              How PrepAI
              <br />
              <span className="gradient-text">gets you job-ready</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              No guesswork, no wasted practice. A clear path from your first assessment to the day you sign your offer —
              with an AI coach guiding every step.
            </p>
          </div>
        </div>
      </section>

      {/* Steps with connecting flow */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/40 via-accent-500/40 to-success-500/40 sm:-translate-x-1/2" aria-hidden />

            <div className="space-y-8 lg:space-y-12">
              {steps.map((step, idx) => {
                const isRight = idx % 2 === 1;
                return (
                  <div
                    key={step.num}
                    className={cn(
                      'relative flex items-start gap-6 animate-slide-up',
                      'lg:grid lg:grid-cols-2 lg:gap-12',
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Number node */}
                    <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 z-10">
                      <div className={cn('h-12 w-12 rounded-full flex items-center justify-center text-primary ring-4 ring-app', step.accent)}>
                        <step.icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Card */}
                    <div className={cn('ml-16 lg:ml-0', isRight ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1')}>
                      <Card hover className="h-full">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <span className="font-display text-3xl font-extrabold text-app-border" style={{ color: 'rgb(var(--color-border))' }}>
                            {step.num}
                          </span>
                          <Badge variant="default" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </Badge>
                        </div>
                        <h3 className="font-display text-xl font-semibold text-main">{step.title}</h3>
                        <p className="mt-2 text-sm text-muted leading-relaxed">{step.desc}</p>
                        <ul className="mt-4 space-y-2">
                          {step.details.map((d) => (
                            <li key={d} className="flex items-start gap-2 text-sm text-muted">
                              <Check className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="accent" className="mb-4">What makes it different</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Why PrepAI beats the old way</h2>
            <p className="mt-4 text-muted">
              Tutoring and peer mock interviews help — but they are expensive, hard to schedule, and forget you between
              sessions. PrepAI is always on, always personal.
            </p>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 border-b border-app surface-2 text-sm font-semibold text-main">
              <div className="col-span-6">Capability</div>
              <div className="col-span-3 text-center">PrepAI</div>
              <div className="col-span-3 text-center">Traditional</div>
            </div>
            {/* Rows */}
            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className={cn(
                  'grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 items-center text-sm',
                  i % 2 === 1 && 'surface-2/60',
                )}
              >
                <div className="col-span-6">
                  <p className="font-medium text-main">{row.feature}</p>
                  <p className="mt-0.5 text-xs text-muted">{row.notes}</p>
                </div>
                <div className="col-span-3 flex justify-center">
                  {row.nonecoach ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-500/10 text-success-600 dark:text-success-400">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-error-500/10 text-error-600 dark:text-error-400">
                      <X className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="col-span-3 flex justify-center">
                  {row.traditional ? (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-500/10 text-success-600 dark:text-success-400">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-error-500/10 text-error-600 dark:text-error-400">
                      <X className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Practice modalities mini-grid */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="primary" className="mb-4">Practice modalities</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Four ways to practice, one coach</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users, title: 'Voice interviews', desc: 'Spoken HR, behavioral, and technical rounds with live AI dialogue.' },
              { icon: Code2, title: 'Live coding', desc: 'Real editor, test cases, hints, and AI code review on every solve.' },
              { icon: Mic, title: 'English drills', desc: 'Conversation, pronunciation, and fluency exercises with instant scoring.' },
              { icon: Network, title: 'System design', desc: 'Whiteboard sessions with probing follow-ups and trade-off debates.' },
            ].map((m) => (
              <Card key={m.title} hover className="group text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <m.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-semibold text-main">{m.title}</h3>
                <p className="mt-2 text-sm text-muted">{m.desc}</p>
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
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Your first step takes 10 minutes</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Sign up free, take the assessment, and get your personalized roadmap today. Your AI coach is ready when you are.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {user ? 'Go to Dashboard' : 'Get started free'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/practice-categories')}>
                  Browse practice
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}


