import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  Check,
  GraduationCap,
  RefreshCw,
  Compass,
  Users,
  Globe,
  Code2,
  Bot,
  Award,
  Clock,
  ShieldCheck,
  Mic,
  type LucideIcon,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const stats = [
  { value: '160+', label: 'Practice paths' },
  { value: '13', label: 'Interview formats' },
  { value: '24/7', label: 'AI coach availability' },
  { value: '<1s', label: 'Feedback latency' },
];

const problems = [
  {
    icon: Clock,
    title: 'Interview anxiety',
    desc: 'Knowing the material is not enough. Performing under pressure is a separate skill — and most people only practice it in the real interview, when it is too late.',
  },
  {
    icon: Users,
    title: 'No practice partner',
    desc: 'Mock interviews need a partner, but peers are busy, tutors are expensive, and scheduling never lines up. So practice stays sporadic and improvement stalls.',
  },
  {
    icon: Globe,
    title: 'English barriers',
    desc: 'For non-native speakers, the interview is two tests at once: the technical content and the English. One weakens the other, and neither gets isolated practice.',
  },
];

const solutionPoints = [
  'A single AI mentor that remembers your history and adapts to your level',
  'Live voice interviews that build real speaking confidence under pressure',
  'English, coding, and system design practice unified in one place',
  'A personalized roadmap that reshuffles itself as you grow',
  'Instant, detailed feedback after every single session',
  'Available at 2am, on your commute, or between meetings',
];

const values: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Target,
    title: 'Outcomes over activity',
    desc: 'We measure success by offers landed and confidence gained — not minutes spent. Every feature exists to move you closer to the job.',
  },
  {
    icon: Bot,
    title: 'AI as a mentor, not a gimmick',
    desc: 'We build AI that remembers, adapts, and coaches like a human would. Technology should feel like a relationship, not a chatbot.',
  },
  {
    icon: ShieldCheck,
    title: 'Honesty & privacy first',
    desc: 'Your data is yours. We do not sell it, and we keep pricing transparent. The free plan is genuinely free — not a trap.',
  },
  {
    icon: Heart,
    title: 'Access for everyone',
    desc: 'Great coaching should not depend on where you were born or what you can pay. We offer regional and student pricing so talent is the only bar.',
  },
  {
    icon: Zap,
    title: 'Practice beats perfection',
    desc: 'We believe in showing up daily over cramming. Small, consistent reps compound into real skill — and our roadmap is built to make that easy.',
  },
  {
    icon: Compass,
    title: 'Adapt, do not assume',
    desc: 'No two learners are the same. The coach adapts to your goals, schedule, and weak spots rather than forcing you through a generic template.',
  },
];

const builtFor: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: GraduationCap,
    title: 'Students & new grads',
    desc: 'Facing your first technical interviews with limited real-world reps. Build the habits and confidence before the stakes are high.',
  },
  {
    icon: RefreshCw,
    title: 'Career switchers',
    desc: 'Coming from another field and need to get interview-ready fast. An adaptive roadmap compresses months of guesswork into a focused plan.',
  },
  {
    icon: Globe,
    title: 'Non-native English speakers',
    desc: 'Your technical skills are strong but English holds you back in interviews. Targeted pronunciation, fluency, and interview-English drills close the gap.',
  },
  {
    icon: Code2,
    title: 'Senior engineers',
    desc: 'Sharpening system design and behavioral storytelling after years away from the interview circuit. Practice the formats that senior loops demand.',
  },
];

export function AboutPage() {
  useDocumentTitle('About');
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero / mission */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-20 lg:pt-28 lg:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Our mission</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Great coaching should not
              <br />
              <span className="gradient-text">depend on luck or money</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              PrepAI exists to give every serious learner a personal AI mentor for English speaking and interview
              preparation — available 24/7, adaptive to their journey, and honest about pricing.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                {user ? 'Go to Dashboard' : 'Get started free'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/features')}>
                Explore features
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {stats.map((s) => (
              <Card key={s.label} className="text-center !p-5">
                <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="warning" className="mb-4">The problem</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Interview prep is broken</h2>
            <p className="mt-4 text-muted">
              The skills that decide your career trajectory are the ones people practice the least. Here is why.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p) => (
              <Card key={p.title} hover className="group h-full">
                <div className="h-12 w-12 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-600 dark:text-warning-400 mb-4">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-main">{p.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The solution */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="success" className="mb-4">The solution</Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">A coach available 24/7</h2>
              <p className="mt-4 text-muted text-lg">
                PrepAI turns interview preparation from a sporadic, expensive, anxiety-ridden chore into a daily,
                guided habit. Your AI mentor is always on, always personal, and always honest.
              </p>
              <ul className="mt-6 space-y-3">
                {solutionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-main">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button onClick={() => navigate('/how-it-works')} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  See how it works
                </Button>
              </div>
            </div>

            <Card className="relative overflow-hidden !p-8">
              <div className="relative space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl surface-2 border border-app flex items-center justify-center text-primary">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-main">Your AI Coach</p>
                    <p className="text-xs text-muted">Always on · Remembers you · Adapts daily</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Mic, label: 'Voice interview simulation', value: 'Live dialogue' },
                    { icon: Code2, label: 'Coding with AI review', value: 'Real editor' },
                    { icon: Globe, label: 'English fluency drills', value: 'Instant scoring' },
                    { icon: Compass, label: 'Adaptive roadmap', value: 'Rebalances weekly' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl surface-2 border border-app px-4 py-3">
                      <span className="flex items-center gap-2.5 text-sm font-medium text-main">
                        <row.icon className="h-4 w-4 text-primary" />
                        {row.label}
                      </span>
                      <span className="text-xs text-muted">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="primary" className="mb-4">What we value</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Principles behind the product</h2>
            <p className="mt-4 text-muted">These shape every decision we make — from roadmap design to pricing.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <Card key={v.title} hover className="group h-full">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-main">{v.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Built for */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="accent" className="mb-4">Built for</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Made for serious learners</h2>
            <p className="mt-4 text-muted">Whatever stage you are at, the coach meets you there.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {builtFor.map((b) => (
              <Card key={b.title} hover className="group text-center h-full">
                <div className="mx-auto h-12 w-12 rounded-xl surface-2 border border-app flex items-center justify-center text-primary mb-4">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-semibold text-main">{b.title}</h3>
                <p className="mt-2 text-sm text-muted">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team / creator */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="primary" className="mb-4">The team</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Built by people who have been there</h2>
          </div>
          <Card className="!p-8 lg:!p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="h-20 w-20 rounded-2xl surface-2 border border-app flex items-center justify-center text-primary shrink-0">
                <Award className="h-10 w-10" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-display text-xl font-bold text-main">A small, focused team</h3>
                <p className="mt-3 text-muted leading-relaxed">
                  PrepAI is built by engineers and educators who have sat on both sides of the interview table —
                  as nervous candidates and as interviewers watching talented people stumble on avoidable mistakes. We
                  have felt the anxiety, the language barriers, and the frustration of not having anyone to practice
                  with. PrepAI is the tool we wished existed.
                </p>
                <p className="mt-3 text-muted leading-relaxed">
                  We are a lean team obsessed with one thing: helping you walk into your next interview calm, prepared,
                  and genuinely confident. No vanity metrics, no fluff — just a coach that works.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-16 text-center">
            <div className="relative">
              <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Your AI coach is waiting</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Start free today. Take the assessment, get your roadmap, and begin the practice that gets you the offer.
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


