import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  BookOpen,
  AudioLines,
  Gauge,
  Ear,
  Languages,
  Users,
  UserCheck,
  Cpu,
  Code2,
  Network,
  Building2,
  MonitorSmartphone,
  Server,
  Layers,
  Boxes,
  Database,
  Brain,
  Bot,
  Link2,
  MessageCircle,
  ShoppingCart,
  Hash,
  Binary,
  TreePine,
  GitFork,
  Grid3x3,
  ListTree,
  ArrowRight,
  Sparkles,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'All levels';

interface Category {
  icon: LucideIcon;
  name: string;
  desc: string;
  difficulty: Difficulty;
}

interface CategoryGroup {
  id: string;
  label: string;
  heading: string;
  subheading: string;
  iconBg: string;
  accentBadge: 'primary' | 'accent' | 'success';
  categories: Category[];
}

const groups: CategoryGroup[] = [
  {
    id: 'english',
    label: 'English Speaking',
    heading: 'Speak clearly, think in English',
    subheading: 'Seven focused tracks that take you from hesitant to fluent — covering conversation, grammar, vocabulary, pronunciation, and more.',
    iconBg: 'surface-2 border border-app',
    accentBadge: 'primary',
    categories: [
      { icon: MessageSquare, name: 'Daily Conversation', desc: 'Natural back-and-forth on real-world topics — travel, work, small talk, opinions.', difficulty: 'Beginner' },
      { icon: BookOpen, name: 'Grammar & Accuracy', desc: 'Tense, articles, prepositions, and sentence structure with inline corrections.', difficulty: 'Beginner' },
      { icon: Mic, name: 'Vocabulary Builder', desc: 'Learn richer, precise words with spaced repetition that makes them stick.', difficulty: 'Intermediate' },
      { icon: AudioLines, name: 'Pronunciation Drill', desc: 'Phoneme-level scoring and targeted exercises for tricky sounds.', difficulty: 'Intermediate' },
      { icon: Gauge, name: 'Fluency Training', desc: 'Reduce filler words, control pacing, and build smooth, connected speech.', difficulty: 'Intermediate' },
      { icon: Ear, name: 'Listening Comprehension', desc: 'Follow meetings and interviews across accents and speeds.', difficulty: 'Intermediate' },
      { icon: Languages, name: 'Interview English', desc: 'English specifically for interviews — storytelling, technical terms, and clarity under pressure.', difficulty: 'Advanced' },
    ],
  },
  {
    id: 'interview',
    label: 'Interview Practice',
    heading: 'Thirteen interview formats, one place',
    subheading: 'Rehearse every round you will face — from recruiter screens to deep technical and domain-specific interviews — with an AI interviewer that adapts.',
    iconBg: 'surface-2 border border-app',
    accentBadge: 'accent',
    categories: [
      { icon: Users, name: 'HR & Recruiter', desc: '“Tell me about yourself,” salary, motivation, and culture-fit questions.', difficulty: 'Beginner' },
      { icon: UserCheck, name: 'Behavioral', desc: 'STAR-method stories with probing follow-ups and competency scoring.', difficulty: 'Intermediate' },
      { icon: Cpu, name: 'Technical Q&A', desc: 'Domain knowledge across frontend, backend, data, and infra.', difficulty: 'Intermediate' },
      { icon: Code2, name: 'Coding Interview', desc: 'Algorithm problems in a live editor with test cases and AI review.', difficulty: 'Intermediate' },
      { icon: MonitorSmartphone, name: 'Frontend Interview', desc: 'Component design, state management, performance, and accessibility.', difficulty: 'Advanced' },
      { icon: Server, name: 'Backend Interview', desc: 'API design, concurrency, caching, and database internals.', difficulty: 'Advanced' },
      { icon: Layers, name: 'Full-Stack Interview', desc: 'End-to-end feature design spanning frontend, API, and data.', difficulty: 'Advanced' },
      { icon: Boxes, name: 'DevOps Interview', desc: 'CI/CD, containers, observability, and incident response.', difficulty: 'Advanced' },
      { icon: Network, name: 'System Design', desc: 'Whiteboard scalable systems with trade-off and failure-mode probing.', difficulty: 'Advanced' },
      { icon: Brain, name: 'Product Manager', desc: 'Product sense, prioritization, metrics, and estimation questions.', difficulty: 'Advanced' },
      { icon: Database, name: 'Data Science', desc: 'Statistics, ML fundamentals, case studies, and SQL rigor.', difficulty: 'Advanced' },
      { icon: Bot, name: 'AI / ML', desc: 'Model design, evaluation, deployment, and ethics for ML roles.', difficulty: 'Advanced' },
      { icon: Building2, name: 'Company-Specific', desc: 'Mock rounds calibrated to FAANG, unicorns, and remote-first startups.', difficulty: 'All levels' },
    ],
  },
  {
    id: 'coding',
    label: 'Coding Practice',
    heading: 'Master the patterns, not just the problems',
    subheading: 'Topic-organized coding drills that build real pattern recognition — so a novel problem on interview day feels familiar.',
    iconBg: 'surface-2 border border-app',
    accentBadge: 'success',
    categories: [
      { icon: Hash, name: 'Arrays & Strings', desc: 'Two pointers, sliding window, and in-place manipulation fundamentals.', difficulty: 'Beginner' },
      { icon: Binary, name: 'Hash Maps & Sets', desc: 'O(1) lookup patterns for counting, grouping, and deduplication.', difficulty: 'Beginner' },
      { icon: ListTree, name: 'Linked Lists', desc: 'Pointer manipulation, reversal, cycle detection, and merge patterns.', difficulty: 'Intermediate' },
      { icon: GitFork, name: 'Stacks & Queues', desc: 'Monotonic stacks, valid parentheses, and BFS/DFS scaffolding.', difficulty: 'Intermediate' },
      { icon: TreePine, name: 'Trees & BSTs', desc: 'Traversal, balancing, LCA, and recursive tree reasoning.', difficulty: 'Intermediate' },
      { icon: Grid3x3, name: 'Graphs', desc: 'BFS, DFS, topological sort, union-find, and shortest paths.', difficulty: 'Advanced' },
      { icon: Brain, name: 'Dynamic Programming', desc: '1D/2D DP, memoization, and recognizing state transitions.', difficulty: 'Advanced' },
      { icon: Boxes, name: 'Heap & Priority Queue', desc: 'Top-K problems, scheduling, and streaming medians.', difficulty: 'Advanced' },
    ],
  },
  {
    id: 'system-design',
    label: 'System Design',
    heading: 'Design systems that scale',
    subheading: 'Classic and modern design problems with an AI interviewer that probes your assumptions, trade-offs, and failure modes just like a staff engineer.',
    iconBg: 'surface-2 border border-app',
    accentBadge: 'primary',
    categories: [
      { icon: Link2, name: 'URL Shortener', desc: 'Design a scalable link shortener with analytics and caching.', difficulty: 'Intermediate' },
      { icon: MessageCircle, name: 'Chat System', desc: 'Real-time messaging with presence, delivery guarantees, and scale.', difficulty: 'Advanced' },
      { icon: Network, name: 'Rate Limiter', desc: 'Token bucket vs. leaky bucket across distributed edge nodes.', difficulty: 'Intermediate' },
      { icon: Database, name: 'Key-Value Store', desc: 'Build a distributed KV store with consistency and partitioning.', difficulty: 'Advanced' },
      { icon: ShoppingCart, name: 'E-Commerce Checkout', desc: 'Inventory, payments, idempotency, and order fulfillment at scale.', difficulty: 'Advanced' },
      { icon: Boxes, name: 'Notification System', desc: 'Multi-channel fan-out with backpressure and deduplication.', difficulty: 'Advanced' },
      { icon: Bot, name: 'News Feed', desc: 'Ranking, fan-out-on-write vs. read, and timeline pagination.', difficulty: 'Advanced' },
    ],
  },
];

function difficultyVariant(d: Difficulty): 'success' | 'warning' | 'error' | 'default' {
  if (d === 'Beginner') return 'success';
  if (d === 'Intermediate') return 'warning';
  if (d === 'Advanced') return 'error';
  return 'default';
}

export function PracticeCategoriesPage() {
  useDocumentTitle('Practice Categories');
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalCategories = groups.reduce((n, g) => n + g.categories.length, 0);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{totalCategories} practice paths and counting</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Pick what to
              <br />
              <span className="gradient-text">practice today</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A full catalog of English, interview, coding, and system design practice. Every path is graded, tracked,
              and woven into your personalized roadmap.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                {user ? 'Go to Dashboard' : 'Get started free'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/roadmap')}>
                See the roadmap
              </Button>
            </div>
          </div>

          {/* Quick category nav */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="chip hover:text-main transition-colors">
                {g.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Category groups */}
      {groups.map((group, idx) => (
        <section
          key={group.id}
          id={group.id}
          className={cn('py-20 lg:py-24 scroll-mt-20', idx % 2 === 1 && 'surface-2 border-y border-app')}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <Badge variant={group.accentBadge} className="mb-4">{group.label}</Badge>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">{group.heading}</h2>
                <p className="mt-4 text-muted text-lg">{group.subheading}</p>
              </div>
              <p className="text-sm text-muted shrink-0">
                <span className="font-display text-2xl font-bold text-main">{group.categories.length}</span> paths
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {group.categories.map((cat) => (
                <Card key={cat.name} hover className="group flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center text-primary', group.iconBg)}>
                      <cat.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={difficultyVariant(cat.difficulty)}>{cat.difficulty}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-main">{cat.name}</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed flex-1">{cat.desc}</p>
                  <button
                    onClick={() => navigate(user ? '/app/dashboard' : '/register')}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                  >
                    Practice
                    <ArrowRight className="h-4 w-4" />
                  </button>
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
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">{totalCategories} paths. One coach.</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Every category feeds the same AI coach and the same analytics — so progress in one area lifts the rest.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
                {['No credit card', 'Practice instantly', 'All categories included on Pro'].map((t) => (
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
