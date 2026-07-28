import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  BookOpen,
  AudioLines,
  Gauge,
  Ear,
  Users,
  UserCheck,
  Cpu,
  Code2,
  Network,
  Building2,
  Map,
  CalendarCheck,
  Radar,
  HeartPulse,
  TrendingUp,
  GitBranch,
  LineChart,
  Trophy,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

interface Feature {
  icon: typeof Mic;
  title: string;
  desc: string;
}

interface FeatureSection {
  id: string;
  label: string;
  heading: string;
  subheading: string;
  accent: string;
  iconBg: string;
  features: Feature[];
}

const sections: FeatureSection[] = [
  {
    id: 'english',
    label: 'English Speaking',
    heading: 'Speak English with confidence',
    subheading:
      'Every conversation is a chance to improve. Practice real dialogue, sharpen grammar, expand vocabulary, and polish pronunciation with instant, nuanced AI feedback.',
    accent: 'text-brand-600 dark:text-brand-300',
    iconBg: 'surface-2 border border-app',
    features: [
      {
        icon: MessageSquare,
        title: 'Live conversation practice',
        desc: 'Hold natural back-and-forth voice conversations on dozens of real-world topics — ordering food, job small talk, defending an opinion — with an AI partner that responds instantly.',
      },
      {
        icon: BookOpen,
        title: 'Grammar correction',
        desc: 'Every sentence you speak is analyzed in real time. Get inline corrections for tense, articles, prepositions, and word order with clear explanations you can learn from.',
      },
      {
        icon: Mic,
        title: 'Vocabulary building',
        desc: 'The coach tracks words you overuse and surfaces richer alternatives tailored to your level, plus spaced-repetition review so new vocabulary actually sticks.',
      },
      {
        icon: AudioLines,
        title: 'Pronunciation scoring',
        desc: 'Phoneme-level pronunciation analysis scores each sound, flags the ones you struggle with, and gives targeted drills to fix them fast.',
      },
      {
        icon: Gauge,
        title: 'Fluency metrics',
        desc: 'WPM, pause count, filler-word frequency, and restart rate are measured every session so you can watch your fluency climb week over week.',
      },
      {
        icon: Ear,
        title: 'Listening comprehension',
        desc: 'Audio exercises at adjustable speeds and accents train your ear to follow meetings, interviews, and casual conversation without freezing up.',
      },
    ],
  },
  {
    id: 'interview',
    label: 'Interview Practice',
    heading: 'Rehearse every round, every type',
    subheading:
      'From the first HR screen to the final system design whiteboard, practice the exact interview formats top companies use — with an AI interviewer that adapts to your answers.',
    accent: 'text-accent-600 dark:text-accent-300',
    iconBg: 'surface-2 border border-app',
    features: [
      {
        icon: Users,
        title: 'HR & recruiter rounds',
        desc: '“Tell me about yourself,” salary expectations, why this company — nail the soft rounds that filter more candidates than any technical screen.',
      },
      {
        icon: UserCheck,
        title: 'Behavioral interviews',
        desc: 'STAR-method practice with probing follow-ups. The coach checks whether your stories actually demonstrate the competency and flags vague answers.',
      },
      {
        icon: Cpu,
        title: 'Technical rounds',
        desc: 'Domain Q&A for frontend, backend, data, and DevOps — from browser rendering to database indexing — graded on depth, clarity, and accuracy.',
      },
      {
        icon: Code2,
        title: 'Coding interviews',
        desc: 'Solve in a real editor with test cases, hints, and AI code review. Complexity analysis and alternative approaches are discussed after every solve.',
      },
      {
        icon: Network,
        title: 'System design',
        desc: 'Whiteboard a URL shortener, chat system, or feed. The AI probes your trade-offs, scaling assumptions, and failure modes just like a real staff engineer.',
      },
      {
        icon: Building2,
        title: 'Company-specific mocks',
        desc: 'Practice with question styles and difficulty calibrated to target companies — FAANG, unicorns, and remote-first startups each have their own flavor.',
      },
    ],
  },
  {
    id: 'coach',
    label: 'AI Coach',
    heading: 'A coach that actually remembers you',
    subheading:
      'Your AI coach builds a living model of your skills, plans your week, finds your weak spots, and keeps you motivated — so every session moves you forward instead of repeating.',
    accent: 'text-success-600 dark:text-success-400',
    iconBg: 'surface-2 border border-app',
    features: [
      {
        icon: Map,
        title: 'Personalized roadmap',
        desc: 'A week-by-week plan built from your assessment, target role, and timeline. It reshuffles automatically as you master skills faster — or slower — than expected.',
      },
      {
        icon: CalendarCheck,
        title: 'Daily missions',
        desc: 'Bite-sized, 15–30 minute missions that fit any schedule. Each one targets a specific skill so consistent practice always beats cramming.',
      },
      {
        icon: Radar,
        title: 'Weak-area detection',
        desc: 'The coach continuously surfaces the two or three areas costing you the most interview wins and prioritizes them until they are strengths.',
      },
      {
        icon: HeartPulse,
        title: 'Motivation & nudges',
        desc: 'Streaks, milestones, and contextual encouragement keep you going. The coach adapts its tone — supportive when you are struggling, challenging when you are cruising.',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    heading: 'See exactly where you are improving',
    subheading:
      'Stop guessing. Skill trees, confidence graphs, and achievements turn subjective “I think I am getting better” into measurable proof you can trust.',
    accent: 'text-brand-600 dark:text-brand-300',
    iconBg: 'surface-2 border border-app',
    features: [
      {
        icon: GitBranch,
        title: 'Skill tree',
        desc: 'A visual map of every skill — from basic grammar to advanced system design — with mastery levels. Prerequisites unlock as you progress, just like a game.',
      },
      {
        icon: LineChart,
        title: 'Confidence graph',
        desc: 'Track your confidence and accuracy across English, coding, and interview categories over time. Spot plateaus before they become problems.',
      },
      {
        icon: Trophy,
        title: 'Achievements',
        desc: 'Earn badges for streaks, first perfect scores, category mastery, and mock-interview milestones — small wins that build real momentum.',
      },
      {
        icon: TrendingUp,
        title: 'AI insight summaries',
        desc: 'Weekly AI-generated summaries highlight your biggest wins, remaining gaps, and the single highest-impact thing to practice next.',
      },
    ],
  },
];

export function FeaturesPage() {
  useDocumentTitle('Features');
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-20 lg:pt-28 lg:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Full feature catalog</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Everything you need to
              <br />
              <span className="gradient-text">ace the interview</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              PrepAI covers the entire journey — English fluency, every interview format, an AI coach
              that adapts to you, and analytics that prove you are improving. Explore each capability below.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                {user ? 'Go to Dashboard' : 'Get started free'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/how-it-works')}>
                See how it works
              </Button>
            </div>
          </div>

          {/* Quick category nav */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="chip hover:text-main transition-colors">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      {sections.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          className={cn('py-20 lg:py-24 scroll-mt-20', idx % 2 === 1 && 'surface-2 border-y border-app')}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <Badge variant={idx % 2 === 1 ? 'accent' : 'primary'} className="mb-4">
                {section.label}
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">{section.heading}</h2>
              <p className="mt-4 text-muted text-lg">{section.subheading}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.features.map((f) => (
                <Card key={f.title} hover className="group h-full">
                  <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-primary mb-4', section.iconBg)}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-main">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-16 text-center">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">All of this, in one coach</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                No more juggling five tools. PrepAI unifies English, interviews, coding, system design, and
                analytics under a single AI mentor that grows with you.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
                {['No credit card', 'Practice instantly', 'Your own AI coach'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-success-500" />
                    {t}
                  </span>
                ))}
              </div>
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


