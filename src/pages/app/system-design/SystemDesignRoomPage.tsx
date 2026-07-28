import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Network,
  Link2,
  MessageSquare,
  Hash,
  Film,
  Car,
  Newspaper,
  Play,
  Square,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Target,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { LoadingState } from '@/components/ui/Feedback';
import { ChatPanel } from '@/components/ChatPanel';
import { useAuth } from '@/context/AuthContext';
import { useAiChat } from '@/hooks/useAiChat';
import { useCreateSession, useUpdateSession } from '@/hooks/useData';
import { callAi } from '@/lib/ai';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, formatTime } from '@/lib/utils';
import type { PracticeSession } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* Problem definitions                                                */
/* ------------------------------------------------------------------ */

type Difficulty = 'easy' | 'medium' | 'hard';

interface SystemDesignProblem {
  slug: string;
  title: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  gradient: string;
  description: string;
  requirements: string[];
  considerations: string[];
}

const PROBLEMS: Record<string, SystemDesignProblem> = {
  'url-shortener': {
    slug: 'url-shortener',
    title: 'URL Shortener',
    icon: Link2,
    difficulty: 'easy',
    gradient: 'surface-2 border border-app',
    description:
      'Design a URL shortening service (like bit.ly) that takes a long URL and returns a short, unique alias. When a user visits the short URL, the service redirects them to the original long URL.',
    requirements: [
      'Generate a unique short URL for a given long URL',
      'Redirect short URL to the original long URL',
      'Support 100M new URLs per month with 10x read-to-write ratio',
      'Short URLs should be 6-8 characters and not guessable',
      'URLs do not expire (or optionally expire after a set time)',
    ],
    considerations: [
      'Encoding strategy: base62 vs hash vs auto-increment counter',
      'Collision handling and uniqueness guarantees',
      'Cache layer (Redis/Memcached) for hot redirects',
      'Database choice: NoSQL (Cassandra) vs SQL (Postgres) at scale',
      'High availability and read replicas for redirect traffic',
    ],
  },
  'chat-system': {
    slug: 'chat-system',
    title: 'Chat System',
    icon: MessageSquare,
    difficulty: 'medium',
    gradient: 'surface-2 border border-app',
    description:
      'Design a real-time chat application supporting 1:1 and group conversations, online presence, message delivery guarantees, and message history.',
    requirements: [
      'Support 1:1 and group chats (up to 100 members)',
      'Real-time message delivery with ordering guarantees',
      'Online/offline presence and typing indicators',
      'Message history and search across conversations',
      'Support media attachments and notifications',
    ],
    considerations: [
      'Protocol choice: WebSocket vs long polling vs SSE',
      'Message queue (Kafka) for ordering and fan-out',
      'Storage: Cassandra for messages, Redis for presence',
      'Sequence numbers / timestamps for ordering at scale',
      'Push notifications via APNs/FCM for offline users',
    ],
  },
  twitter: {
    slug: 'twitter',
    title: 'Twitter / X',
    icon: Hash,
    difficulty: 'hard',
    gradient: 'surface-2 border border-app',
    description:
      'Design a microblogging platform where users post short messages, follow other users, and view a personalized timeline of tweets from people they follow.',
    requirements: [
      'Post tweets (up to 280 chars) with media attachments',
      'Follow/unfollow other users',
      'Generate a home timeline from followed accounts',
      'Support 150M DAU posting ~500M tweets/day',
      'Timeline generation under 200ms p99 latency',
    ],
    considerations: [
      'Fan-out on write vs fan-out on read for timelines',
      'Handling celebrity accounts with millions of followers',
      'Timeline caching in Redis with precomputed feeds',
      'Sharding strategy for user and tweet data',
      'Trending topics via real-time aggregation',
    ],
  },
  netflix: {
    slug: 'netflix',
    title: 'Netflix',
    icon: Film,
    difficulty: 'hard',
    gradient: 'surface-2 border border-app',
    description:
      'Design a global video streaming platform that serves on-demand video content to hundreds of millions of users with low startup latency and high availability.',
    requirements: [
      'Stream video on-demand to 200M+ subscribers globally',
      'Support adaptive bitrate streaming (multiple resolutions)',
      'Browse, search, and recommendation features',
      'Handle 100k+ titles with multi-device playback',
      'Low startup time (< 2s) and minimal buffering',
    ],
    considerations: [
      'CDN strategy: edge caching and Open Connect appliances',
      'Encoding pipeline: multi-resolution transcode with ABR',
      'Video chunking (HLS/DASH) and manifest files',
      'Metadata service and recommendation engine',
      'Regional failover and traffic shifting',
    ],
  },
  'ride-sharing': {
    slug: 'ride-sharing',
    title: 'Ride Sharing (Uber)',
    icon: Car,
    difficulty: 'hard',
    gradient: 'surface-2 border border-app',
    description:
      'Design a ride-sharing platform that matches riders with nearby drivers in real time, handles trip lifecycle, pricing, and location tracking at city scale.',
    requirements: [
      'Riders request a ride and get matched to a nearby driver',
      'Drivers share real-time GPS location continuously',
      'Estimate trip time and fare upfront',
      'Support surge pricing based on demand/supply',
      'Handle 10M+ trips per day in a major city',
    ],
    considerations: [
      'Geospatial index: geohash vs quadtree for nearby-driver queries',
      'Location updates at high frequency (every few seconds)',
      'Matching algorithm and dispatch service',
      'Surge pricing computation from real-time demand',
      'WebSockets for live location and trip updates',
    ],
  },
  'news-feed': {
    slug: 'news-feed',
    title: 'News Feed',
    icon: Newspaper,
    difficulty: 'hard',
    gradient: 'surface-2 border border-app',
    description:
      'Design a ranked news feed that aggregates content from followed sources, applies ranking and personalization, and serves a paginated feed to each user.',
    requirements: [
      'Aggregate posts from followed users/pages',
      'Rank posts by relevance, recency, and engagement signals',
      'Support pagination and infinite scroll',
      'Personalize feed per user interests',
      'Serve feed in under 300ms with fresh content',
    ],
    considerations: [
      'Fan-out on write vs read for feed generation',
      'Ranking model: ML-based vs heuristic scoring',
      'Caching strategy for precomputed feed segments',
      'Handling cold-start users with no signal',
      'Real-time injection of breaking/viral content',
    ],
  },
};

function getProblem(slug: string | undefined): SystemDesignProblem {
  if (slug && PROBLEMS[slug]) return PROBLEMS[slug];
  return {
    slug: slug ?? 'custom',
    title: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'System Design',
    icon: Network,
    difficulty: 'medium',
    gradient: 'surface-2 border border-app',
    description:
      'A system design interview session. Work with the interviewer to clarify requirements, propose an architecture, discuss data models, and justify your trade-offs.',
    requirements: [
      'Clarify functional and non-functional requirements',
      'Propose a high-level architecture with key components',
      'Define the data model and storage choices',
      'Discuss scaling, caching, and bottlenecks',
      'Justify trade-offs and alternatives',
    ],
    considerations: [
      'Back-of-the-envelope capacity estimates',
      'Single points of failure and redundancy',
      'Consistency vs availability trade-offs (CAP)',
      'Latency, throughput, and cost considerations',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Session summary shape                                              */
/* ------------------------------------------------------------------ */

interface CategoryScore {
  name: string;
  score: number;
}
interface SessionSummary {
  score: number;
  category_scores: CategoryScore[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-success-500';
  if (score >= 60) return 'text-warning-500';
  return 'text-error-500';
}
function scoreBgClass(score: number): string {
  if (score >= 80) return 'surface-2 border border-app';
  if (score >= 60) return 'surface-2 border border-app';
  return 'surface-2 border border-app';
}
function scoreProgressColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}
function diffVariant(d: Difficulty): 'success' | 'warning' | 'error' {
  return d === 'easy' ? 'success' : d === 'medium' ? 'warning' : 'error';
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

type Phase = 'start' | 'live' | 'ending' | 'results';

export function SystemDesignRoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const problem = useMemo(() => getProblem(slug), [slug]);
  useDocumentTitle(`${problem.title} — System Design`);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const [phase, setPhase] = useState<Phase>('start');
  const [seconds, setSeconds] = useState(0);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  const sessionCreatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const systemContext = useMemo<Record<string, unknown>>(
    () => ({
      problem_slug: problem.slug,
      problem_title: problem.title,
      problem_description: problem.description,
      requirements: problem.requirements,
      key_considerations: problem.considerations,
      difficulty: problem.difficulty,
      experience_level: profile?.experience_level ?? 'intermediate',
      target_role: profile?.target_role ?? undefined,
      target_companies: profile?.preferred_companies ?? [],
      candidate_name: profile?.display_name ?? undefined,
    }),
    [problem, profile],
  );

  const { messages, loading, error, send, reset } = useAiChat({
    mode: 'interview_system_design',
    systemContext,
    temperature: 0.7,
  });

  /* Guarded session creation on mount (once per slug) */
  useEffect(() => {
    if (sessionCreatedRef.current) return;
    sessionCreatedRef.current = true;
    (async () => {
      const s = await createSession({
        type: 'system_design',
        category: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
      });
      if (s) setSession(s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug]);

  /* Reset when switching problems */
  useEffect(() => {
    sessionCreatedRef.current = false;
    setPhase('start');
    setSeconds(0);
    setSummary(null);
    setEndError(null);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.slug]);

  /* Timer */
  useEffect(() => {
    if (phase === 'live') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  const startSession = () => {
    setSeconds(0);
    setPhase('live');
    void send(
      `Hi, I'm ready to design a ${problem.title.toLowerCase()}. Please start by asking me to clarify the requirements and scope.`,
    );
  };

  const endSession = async () => {
    setPhase('ending');
    setEndError(null);
    try {
      const resp = await callAi<SessionSummary>({
        mode: 'session_summary',
        context: {
          transcript: messages.map((m) => ({ role: m.role, content: m.content })),
          interview_type: 'system_design',
          interview_title: problem.title,
          problem_slug: problem.slug,
          difficulty: problem.difficulty,
          duration_seconds: seconds,
        },
        temperature: 0.4,
      });
      const data = resp.data;
      const safe: SessionSummary = {
        score: typeof data?.score === 'number' ? data.score : 0,
        category_scores: Array.isArray(data?.category_scores)
          ? data.category_scores.filter(
              (c): c is CategoryScore => typeof c?.name === 'string' && typeof c?.score === 'number',
            )
          : [],
        summary: typeof data?.summary === 'string' ? data.summary : '',
        strengths: Array.isArray(data?.strengths) ? data.strengths.filter((x): x is string => typeof x === 'string') : [],
        weaknesses: Array.isArray(data?.weaknesses) ? data.weaknesses.filter((x): x is string => typeof x === 'string') : [],
        recommendations: Array.isArray(data?.recommendations)
          ? data.recommendations.filter((x): x is string => typeof x === 'string')
          : [],
      };
      setSummary(safe);

      if (session) {
        await updateSession(session.id, {
          status: 'completed',
          score: safe.score,
          feedback: safe as unknown as Record<string, unknown>,
          transcript: messages.map((m) => ({ role: m.role, content: m.content })),
          duration_seconds: seconds,
          completed_at: new Date().toISOString(),
        });
      }
      setPhase('results');
    } catch (err) {
      setEndError(err instanceof Error ? err.message : 'Failed to generate session feedback.');
      setPhase('live');
    }
  };

  const practiceAgain = () => {
    reset();
    setSeconds(0);
    setSummary(null);
    setEndError(null);
    setPhase('start');
  };

  return (
    <AppLayout>
      <PageHeader
        title={problem.title}
        description={problem.description}
        icon={<problem.icon className="h-5 w-5" />}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/system-design')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to problems
          </Button>
        }
      />

      {/* START SCREEN */}
      {phase === 'start' && (
        <div className="max-w-3xl mx-auto animate-slide-up">
          <Card className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn('h-16 w-16 rounded-2xl flex items-center justify-center shrink-0', problem.gradient)}>
                <problem.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-main">{problem.title}</h2>
                  <Badge variant={diffVariant(problem.difficulty)} className="capitalize">{problem.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted mt-1">{problem.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="rounded-xl surface-2 p-4 mb-4">
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Key requirements
              </h3>
              <ul className="space-y-2">
                {problem.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key considerations */}
            <div className="rounded-xl surface-2 p-4 mb-6">
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent-500" />
                Key considerations
              </h3>
              <ul className="space-y-2">
                {problem.considerations.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <Sparkles className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={startSession}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Start Session
              </Button>
              <p className="text-xs text-muted flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Typical session: 30–45 minutes
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* LIVE SESSION */}
      {phase === 'live' && (
        <div className="animate-fade-in">
          <Card className="mb-4 !p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', problem.gradient)}>
                  <problem.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-main">{problem.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={diffVariant(problem.difficulty)} className="capitalize">{problem.difficulty}</Badge>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(seconds)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={endSession}
                leftIcon={<Square className="h-4 w-4" />}
              >
                End Session
              </Button>
            </div>
          </Card>

          <Card className="!p-4 h-[60vh] flex flex-col">
            <ChatPanel
              messages={messages}
              loading={loading}
              error={error ?? endError}
              onSend={send}
              voiceEnabled
              autoSpeak={profile?.voice_settings?.auto_listen ?? false}
              ttsVoice={profile?.ai_settings?.voice}
              ttsRate={profile?.ai_settings?.speed ?? 1}
              placeholder="Type or speak your response..."
            />
          </Card>
        </div>
      )}

      {/* ENDING */}
      {phase === 'ending' && (
        <div className="max-w-xl mx-auto animate-fade-in">
          <Card>
            <LoadingState message="Analyzing your system design session and generating detailed feedback..." />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted">
                We're reviewing your transcript to score your design across requirements, architecture, and trade-off discussion.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'results' && summary && (
        <div className="max-w-4xl mx-auto animate-slide-up space-y-6">
          {/* Hero score */}
          <Card className="relative overflow-hidden">
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', scoreBgClass(summary.score))} />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <div className={cn('font-display text-5xl sm:text-6xl font-bold', scoreColorClass(summary.score))}>{summary.score}</div>
                <p className="text-xs text-muted uppercase tracking-wide mt-1">Overall Score</p>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Trophy className={cn('h-5 w-5', scoreColorClass(summary.score))} />
                  <h2 className="font-display text-xl font-bold text-main">{problem.title} — Results</h2>
                </div>
                <Badge variant={diffVariant(problem.difficulty)} className="capitalize">{problem.difficulty}</Badge>
                <span className="text-xs text-muted ml-2 flex items-center gap-1 inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(seconds)}
                </span>
                <p className="text-sm text-muted mt-3 max-w-xl">{summary.summary}</p>
              </div>
            </div>
          </Card>

          {/* Category scores */}
          {summary.category_scores.length > 0 && (
            <Card>
              <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Category Scores
              </h3>
              <div className="space-y-4">
                {summary.category_scores.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-main">{c.name}</span>
                      <span className={cn('text-sm font-bold', scoreColorClass(c.score))}>{c.score}/100</span>
                    </div>
                    <Progress value={c.score} max={100} color={scoreProgressColor(c.score)} size="md" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-500" />
                Strengths
              </h3>
              {summary.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {summary.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <Star className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No specific strengths noted.</p>
              )}
            </Card>

            {/* Weaknesses */}
            <Card>
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning-500" />
                Areas to Improve
              </h3>
              {summary.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {summary.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No major weaknesses noted.</p>
              )}
            </Card>
          </div>

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <Card>
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent-500" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {summary.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <Sparkles className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={practiceAgain} leftIcon={<RotateCcw className="h-4 w-4" />}>
              Practice again
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/app/system-design')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to problems
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
