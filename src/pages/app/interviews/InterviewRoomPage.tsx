import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowLeft,
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
import { LiveVoicePanel } from '@/components/LiveVoicePanel';
import { Radio, Keyboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAiChat } from '@/hooks/useAiChat';
import { useCreateSession, useUpdateSession, useMastery } from '@/hooks/useData';
import { callAi } from '@/lib/ai';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, formatTime } from '@/lib/utils';
import type { PracticeSession } from '@/lib/types';

// Maps the many interview page categories down to the handful of curriculum
// topic slugs seeded in the Mastery Engine (see the mastery_engine migration).
const INTERVIEW_CATEGORY_TO_TOPIC: Record<string, string> = {
  hr: 'iv-b1',
  behavioral: 'iv-b2',
  technical: 'iv-i1',
  coding: 'iv-b3',
  frontend: 'iv-i1',
  backend: 'iv-i1',
  fullstack: 'iv-i1',
  devops: 'iv-i1',
  system_design: 'iv-a1',
  product_manager: 'iv-i2',
  data_science: 'iv-i1',
  ai_ml: 'iv-i1',
  company: 'iv-i4',
};

/* ------------------------------------------------------------------ */
/* Interview type metadata                                            */
/* ------------------------------------------------------------------ */

type Difficulty = 'easy' | 'medium' | 'hard';

interface InterviewTypeMeta {
  slug: string;
  title: string;
  category: string;
  mode: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  expect: string[];
  roleContext?: string;
}

const COMPANY_OPTIONS = [
  'Google',
  'Amazon',
  'Microsoft',
  'Meta',
  'Apple',
  'Netflix',
] as const;

const DURATION_OPTIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 10, label: '10 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '1 hour' },
] as const;

const INTERVIEW_TYPES: Record<string, InterviewTypeMeta> = {
  hr: {
    slug: 'hr',
    title: 'HR Interview',
    category: 'hr',
    mode: 'interview_hr',
    description: 'A general HR interview covering your background, motivation, strengths, and culture fit. Practice answering common opening and closing questions.',
    icon: Users,
    gradient: 'surface-2 border border-app',
    expect: [
      'Tell me about yourself and your background',
      'Why do you want this role / company?',
      'What are your greatest strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Do you have any questions for us?',
    ],
  },
  behavioral: {
    slug: 'behavioral',
    title: 'Behavioral Interview',
    category: 'behavioral',
    mode: 'interview_behavioral',
    description: 'Behavioral questions focused on past experiences. Practice structuring answers with the STAR method (Situation, Task, Action, Result).',
    icon: MessageSquare,
    gradient: 'surface-2 border border-app',
    expect: [
      'Tell me about a time you faced a difficult challenge',
      'Describe a conflict you had with a coworker',
      'Share an example of a project you led',
      'When did you fail and what did you learn?',
      'Tell me about a time you went above and beyond',
    ],
  },
  technical: {
    slug: 'technical',
    title: 'Technical Interview',
    category: 'technical',
    mode: 'interview_technical',
    description: 'Core computer science concepts, programming languages, data structures, and engineering fundamentals.',
    icon: Cpu,
    gradient: 'surface-2 border border-app',
    expect: [
      'Explain a fundamental CS concept in depth',
      'Compare trade-offs between data structures',
      'Discuss language features and best practices',
      'Walk through how a system component works',
      'Answer follow-up probing questions',
    ],
  },
  coding: {
    slug: 'coding',
    title: 'Coding Interview',
    category: 'coding',
    mode: 'interview_coding',
    description: 'Live algorithm and data structure problem solving. Think out loud as you design your approach and write code.',
    icon: Code2,
    gradient: 'surface-2 border border-app',
    expect: [
      'An algorithmic problem with constraints',
      'Discuss time and space complexity',
      'Edge cases and optimization follow-ups',
      'Explain your thought process out loud',
      'Possible variant or follow-up questions',
    ],
  },
  frontend: {
    slug: 'frontend',
    title: 'Frontend Interview',
    category: 'frontend',
    mode: 'interview_technical',
    description: 'Frontend engineering: React, state management, CSS layout, performance, and browser APIs.',
    icon: Layout,
    gradient: 'surface-2 border border-app',
    expect: [
      'React component design and hooks',
      'CSS layout, responsiveness, and accessibility',
      'Browser rendering and performance optimization',
      'State management patterns',
      'Build tooling and frontend architecture',
    ],
    roleContext: 'Frontend Engineer',
  },
  backend: {
    slug: 'backend',
    title: 'Backend Interview',
    category: 'backend',
    mode: 'interview_technical',
    description: 'Backend engineering: APIs, databases, concurrency, caching, and server architecture.',
    icon: Server,
    gradient: 'surface-2 border border-app',
    expect: [
      'API design and REST / GraphQL principles',
      'Database schema, indexing, and query optimization',
      'Concurrency, caching, and scaling strategies',
      'Authentication and security',
      'Microservices and server architecture',
    ],
    roleContext: 'Backend Engineer',
  },
  fullstack: {
    slug: 'fullstack',
    title: 'Full Stack Interview',
    category: 'fullstack',
    mode: 'interview_technical',
    description: 'End-to-end engineering across frontend, backend, and infrastructure.',
    icon: Layers,
    gradient: 'surface-2 border border-app',
    expect: [
      'Design a feature end-to-end',
      'Frontend and backend trade-offs',
      'Data flow from UI to database',
      'Deployment and observability',
      'Architecture and system integration',
    ],
    roleContext: 'Full Stack Engineer',
  },
  devops: {
    slug: 'devops',
    title: 'DevOps Interview',
    category: 'devops',
    mode: 'interview_technical',
    description: 'DevOps and platform engineering: CI/CD, containers, cloud infrastructure, and observability.',
    icon: Cloud,
    gradient: 'surface-2 border border-app',
    expect: [
      'CI/CD pipeline design and tooling',
      'Containers, orchestration, and Kubernetes',
      'Cloud infrastructure (AWS / GCP / Azure)',
      'Monitoring, logging, and incident response',
      'Infrastructure as code',
    ],
    roleContext: 'DevOps Engineer',
  },
  'system-design': {
    slug: 'system-design',
    title: 'System Design Interview',
    category: 'system_design',
    mode: 'interview_system_design',
    description: 'Scalable architecture design. Practice defining requirements, drawing boxes, and justifying trade-offs.',
    icon: Network,
    gradient: 'surface-2 border border-app',
    expect: [
      'Clarify requirements and constraints',
      'High-level architecture and components',
      'Data model and storage choices',
      'Scaling, caching, and bottlenecks',
      'Trade-off discussion and justification',
    ],
  },
  system_design: {
    slug: 'system_design',
    title: 'System Design Interview',
    category: 'system_design',
    mode: 'interview_system_design',
    description: 'Scalable architecture design. Practice defining requirements, drawing boxes, and justifying trade-offs.',
    icon: Network,
    gradient: 'surface-2 border border-app',
    expect: [
      'Clarify requirements and constraints',
      'High-level architecture and components',
      'Data model and storage choices',
      'Scaling, caching, and bottlenecks',
      'Trade-off discussion and justification',
    ],
  },
  'product-manager': {
    slug: 'product-manager',
    title: 'Product Manager Interview',
    category: 'product_manager',
    mode: 'interview_technical',
    description: 'Product sense, metrics, prioritization, and strategy questions.',
    icon: Briefcase,
    gradient: 'surface-2 border border-app',
    expect: [
      'Product design and user-centric thinking',
      'Defining and prioritizing metrics',
      'Trade-offs and feature prioritization',
      'Go-to-market and launch strategy',
      'Stakeholder communication',
    ],
    roleContext: 'Product Manager',
  },
  'data-science': {
    slug: 'data-science',
    title: 'Data Science Interview',
    category: 'data_science',
    mode: 'interview_technical',
    description: 'Statistics, machine learning concepts, experimentation, and data pipelines.',
    icon: Database,
    gradient: 'surface-2 border border-app',
    expect: [
      'Statistical concepts and probability',
      'ML model selection and evaluation',
      'Experiment design and A/B testing',
      'Data pipelines and feature engineering',
      'Business metrics and interpretation',
    ],
    roleContext: 'Data Scientist',
  },
  'ai-ml': {
    slug: 'ai-ml',
    title: 'AI/ML Interview',
    category: 'ai_ml',
    mode: 'interview_technical',
    description: 'Machine learning model design, training, evaluation, and deployment.',
    icon: Brain,
    gradient: 'surface-2 border border-app',
    expect: [
      'Model architecture and design choices',
      'Training, fine-tuning, and evaluation',
      'Deployment and serving at scale',
      'Trade-offs: latency, cost, accuracy',
      'Recent research and best practices',
    ],
    roleContext: 'AI/ML Engineer',
  },
  company: {
    slug: 'company',
    title: 'Company Interview',
    category: 'company',
    mode: 'interview_company',
    description: 'Targeted preparation for FAANG and top tech companies. Choose a company to simulate their interview style.',
    icon: Building2,
    gradient: 'surface-2 border border-app',
    expect: [
      'Company-specific question style and format',
      'Culture and values alignment',
      'Technical + behavioral rounds',
      'Realistic difficulty calibration',
      'Feedback tailored to the company bar',
    ],
  },
};

function getMeta(typeParam: string | undefined): InterviewTypeMeta {
  if (typeParam && INTERVIEW_TYPES[typeParam]) return INTERVIEW_TYPES[typeParam];
  return INTERVIEW_TYPES.hr;
}

/* ------------------------------------------------------------------ */
/* Session summary shape returned by callAi session_summary           */
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
  key_moments: string[];
  coding_topic_slug?: string | null;
}

/* ------------------------------------------------------------------ */
/* Helper: color for a score                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Page component                                                     */
/* ------------------------------------------------------------------ */

type Phase = 'start' | 'live' | 'ending' | 'results';

export function InterviewRoomPage() {
  const { type } = useParams<{ type: string }>();
  const meta = useMemo(() => getMeta(type), [type]);
  useDocumentTitle(`${meta.title} — Interview`);

  const navigate = useNavigate();
  const { profile } = useAuth();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const { topicsWithMastery, recordPractice } = useMastery();
  const interviewTopics = useMemo(() => topicsWithMastery('interview'), [topicsWithMastery]);
  const codingTopics = useMemo(() => topicsWithMastery('coding'), [topicsWithMastery]);

  const [phase, setPhase] = useState<Phase>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [company, setCompany] = useState<string>(COMPANY_OPTIONS[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [seconds, setSeconds] = useState(0);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  const sessionCreatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [engagementMode, setEngagementMode] = useState<'voice' | 'text'>('voice');
  const [liveTranscript, setLiveTranscript] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [voiceConnected, setVoiceConnected] = useState(false);
  // The clock only actually runs once we know the candidate can hear/be
  // heard: immediately in text mode, but only after the Live Voice socket
  // reports "connected" in voice mode — otherwise time burns away during
  // mic-permission prompts or a slow connection, which isn't fair.
  const timerShouldRun = engagementMode === 'text' || voiceConnected;

  const liveSystemInstruction = useMemo(() => {
    const roleLine = meta.category === 'company'
      ? `You are conducting a live ${company} style interview for a ${profile?.target_role ?? 'software engineer'} role.`
      : `You are conducting a live ${meta.title} for a ${profile?.target_role ?? 'software engineer'} role.`;
    return [
      roleLine,
      `Difficulty level: ${difficulty}.`,
      `Candidate experience level: ${profile?.experience_level ?? 'intermediate'}.`,
      'Match your vocabulary and pace to that experience level: keep it simple and encouraging for a beginner, go straight to depth and nuance for advanced/expert.',
      'Speak naturally and conversationally, one short turn at a time. Ask one question, then stop talking and let the candidate answer fully before responding.',
      'Never use markdown, symbols, or written formatting since this is spoken aloud.',
      'You do not have a personal name. If asked, say you are just their interview coach.',
      'Give brief spoken acknowledgement before each new question (e.g. "Good, let\'s move on") but keep it short.',
    ].join(' ');
  }, [meta, company, difficulty, profile]);

  /* systemContext built from profile + interview type */
  const systemContext = useMemo<Record<string, unknown>>(
    () => ({
      interview_type: meta.category,
      interview_title: meta.title,
      difficulty,
      role: meta.roleContext ?? meta.title,
      company: meta.category === 'company' ? company : undefined,
      experience_level: profile?.experience_level ?? 'intermediate',
      target_role: profile?.target_role ?? undefined,
      target_companies: profile?.preferred_companies ?? [],
      candidate_name: profile?.display_name ?? undefined,
    }),
    [meta, difficulty, company, profile],
  );

  const { messages, loading, error, send, reset } = useAiChat({
    mode: meta.mode,
    systemContext,
    temperature: 0.7,
  });

  /* Guarded session creation on mount (once per type) */
  useEffect(() => {
    if (sessionCreatedRef.current) return;
    sessionCreatedRef.current = true;
    (async () => {
      const title =
        meta.category === 'company'
          ? `${company} Interview`
          : meta.title;
      const s = await createSession({
        type: 'interview',
        category: meta.category,
        title,
        difficulty,
      });
      if (s) setSession(s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.slug]);

  /* Reset creation guard when switching interview type */
  useEffect(() => {
    sessionCreatedRef.current = false;
    setPhase('start');
    setSeconds(0);
    setSummary(null);
    setEndError(null);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.slug]);

  /* Timer — counts down from the chosen duration. When it hits zero the
     interview ends automatically. Manual early-exit is locked while running. */
  useEffect(() => {
    if (phase === 'live' && timerShouldRun) {
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
  }, [phase, timerShouldRun]);

  const totalSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalSeconds - seconds);
  const timeIsUp = phase === 'live' && remainingSeconds <= 0;

  useEffect(() => {
    if (timeIsUp) {
      void endInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeIsUp]);

  const startInterview = () => {
    setSeconds(0);
    setPhase('live');
    setLiveTranscript([]);
    setVoiceConnected(false);
    if (engagementMode === 'text') {
      // Kick off the conversation with an AI greeting prompt (classic mode only;
      // live voice mode greets the candidate itself once the socket connects).
      void send(
        meta.category === 'company'
          ? `Hi, I'm ready to begin my ${company} interview. I'm targeting a ${profile?.target_role ?? 'software engineer'} role. Please start when you're ready.`
          : `Hi, I'm ready to begin this ${meta.title.toLowerCase()}. Please start with your first question.`,
      );
    }
  };

  const endInterview = async () => {
    setPhase('ending');
    setEndError(null);
    try {
      const combinedTranscript =
        engagementMode === 'voice' && liveTranscript.length > 0
          ? liveTranscript.map((l) => ({ role: l.role, content: l.text }))
          : messages.map((m) => ({ role: m.role, content: m.content }));

      const resp = await callAi<SessionSummary>({
        mode: 'session_summary',
        context: {
          transcript: combinedTranscript,
          interview_type: meta.category,
          interview_title: meta.title,
          difficulty,
          duration_seconds: seconds,
        },
        temperature: 0.4,
      });
      const data = resp.data;
      const safe: SessionSummary = {
        score: typeof data?.score === 'number' ? data.score : 0,
        category_scores: Array.isArray(data?.category_scores)
          ? data.category_scores.filter(
              (c): c is CategoryScore =>
                typeof c?.name === 'string' && typeof c?.score === 'number',
            )
          : [],
        summary: typeof data?.summary === 'string' ? data.summary : '',
        strengths: Array.isArray(data?.strengths) ? data.strengths.filter((x): x is string => typeof x === 'string') : [],
        weaknesses: Array.isArray(data?.weaknesses) ? data.weaknesses.filter((x): x is string => typeof x === 'string') : [],
        recommendations: Array.isArray(data?.recommendations) ? data.recommendations.filter((x): x is string => typeof x === 'string') : [],
        key_moments: Array.isArray(data?.key_moments) ? data.key_moments.filter((x): x is string => typeof x === 'string') : [],
      };
      setSummary(safe);

      if (session) {
        await updateSession(session.id, {
          status: 'completed',
          score: safe.score,
          feedback: safe as unknown as Record<string, unknown>,
          transcript: combinedTranscript,
          duration_seconds: seconds,
          completed_at: new Date().toISOString(),
        });
      }

      // Feed this result into the Mastery Engine so the matching interview
      // topic's spaced-repetition schedule updates (good score -> comes
      // back later; weak score -> comes back sooner).
      const topicSlug = INTERVIEW_CATEGORY_TO_TOPIC[meta.category];
      if (topicSlug) {
        const topic = interviewTopics.find((t) => t.slug === topicSlug);
        if (topic) void recordPractice(topic.id, safe.score);
      }
      if (safe.coding_topic_slug) {
        const codingTopic = codingTopics.find((t) => t.slug === safe.coding_topic_slug);
        if (codingTopic) void recordPractice(codingTopic.id, safe.score);
      }

      setPhase('results');
    } catch (err) {
      setEndError(err instanceof Error ? err.message : 'Failed to generate interview feedback.');
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

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <AppLayout>
      <PageHeader
        title={meta.title}
        description={meta.description}
        icon={<meta.icon className="h-5 w-5" />}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/interviews')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to interviews
          </Button>
        }
      />

      {/* START SCREEN */}
      {phase === 'start' && (
        <div className="max-w-3xl mx-auto animate-slide-up">
          <Card className="mb-6">
            <div className="flex items-start sm:items-center gap-4 mb-6 flex-col sm:flex-row">
              <div className={cn('h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center shrink-0', meta.gradient)}>
                <meta.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold text-main">{meta.title}</h2>
                <p className="text-sm text-muted mt-1">{meta.description}</p>
              </div>
            </div>

            {/* Company selector for company interviews */}
            {meta.category === 'company' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-main mb-2">Target company</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMPANY_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={cn(
                        'rounded-xl border p-3 text-sm font-medium transition-all text-left',
                        company === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-app surface hover:surface-2 text-main',
                      )}
                    >
                      <Building2 className="h-4 w-4 mb-1.5 opacity-70" />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-main mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'rounded-xl border p-3 text-sm font-medium capitalize transition-all',
                      difficulty === d
                        ? d === 'easy'
                          ? 'border-success-500 bg-success-500/10 text-success-600 dark:text-success-400'
                          : d === 'medium'
                            ? 'border-warning-500 bg-warning-500/10 text-warning-600 dark:text-warning-400'
                            : 'border-error-500 bg-error-500/10 text-error-600 dark:text-error-400'
                        : 'border-app surface hover:surface-2 text-muted',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-main mb-2">
                Interview duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.minutes}
                    onClick={() => setDurationMinutes(d.minutes)}
                    className={cn(
                      'rounded-xl border p-2.5 text-sm font-medium transition-all',
                      durationMinutes === d.minutes
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-app surface hover:surface-2 text-muted',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">
                Once you start, the interview runs for the full duration and can't be
                ended early — just like a real interview. Choose a length you can
                commit to right now.
              </p>
            </div>

            {/* What to expect */}
            <div className="rounded-xl surface-2 p-4 mb-6">
              <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                What to expect
              </h3>
              <ul className="space-y-2">
                {meta.expect.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={startInterview}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Start Interview
              </Button>
              <p className="text-xs text-muted flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {durationMinutes < 60 ? `${durationMinutes} minute` : '1 hour'} session — locked once started
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* LIVE INTERVIEW */}
      {phase === 'live' && (
        <div className="animate-fade-in">
          <Card className="mb-4 !p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', meta.gradient)}>
                  <meta.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-main truncate">
                    {meta.category === 'company' ? `${company} Interview` : meta.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant={difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'error'} >
                      {difficulty}
                    </Badge>
                    <span
                      className={cn(
                        'text-xs flex items-center gap-1 font-medium',
                        !timerShouldRun ? 'text-muted' : remainingSeconds <= 60 ? 'text-error-500' : 'text-muted',
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {timerShouldRun ? `${formatTime(remainingSeconds)} left` : 'Timer starts once connected'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center rounded-xl surface-2 p-1 shrink-0">
                  <button
                    onClick={() => setEngagementMode('voice')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      engagementMode === 'voice' ? 'bg-primary text-primary-fg' : 'text-muted hover:text-main',
                    )}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Live Voice
                  </button>
                  <button
                    onClick={() => setEngagementMode('text')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      engagementMode === 'text' ? 'bg-primary text-primary-fg' : 'text-muted hover:text-main',
                    )}
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                    Text
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 sm:flex-none sm:w-auto"
                    disabled
                    title={`Locked for ${formatTime(remainingSeconds)} — this session runs the full ${durationMinutes} min like a real interview`}
                    leftIcon={<Square className="h-4 w-4" />}
                  >
                    Locked ({formatTime(remainingSeconds)})
                  </Button>
                  <button
                    onClick={() => {
                      if (window.confirm('This ends the interview early, before your chosen time is up. Only do this if something is genuinely wrong (e.g. a real emergency or a technical problem). Continue?')) {
                        void endInterview();
                      }
                    }}
                    className="text-[11px] text-muted hover:text-error-500 underline underline-offset-2"
                  >
                    Exit early (emergency)
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0 sm:!p-4 h-[70vh] sm:h-[60vh] flex flex-col overflow-hidden">
            {engagementMode === 'voice' ? (
              <LiveVoicePanel
                systemInstruction={liveSystemInstruction}
                onTranscriptLine={(role, text) => setLiveTranscript((prev) => [...prev, { role, text }])}
                locked={remainingSeconds > 0}
                remainingSeconds={remainingSeconds}
                onConnectionChange={setVoiceConnected}
                onQuotaExceeded={() => setEngagementMode('text')}
              />
            ) : (
              <ChatPanel
                messages={messages}
                loading={loading}
                error={error ?? endError}
                onSend={send}
                voiceEnabled
                autoSpeak={profile?.voice_settings?.auto_listen ?? false}
                ttsVoice={profile?.ai_settings?.voice}
                ttsRate={profile?.ai_settings?.speed ?? 1}
                placeholder="Type or speak your answer..."
              />
            )}
          </Card>
        </div>
      )}

      {/* ENDING (generating feedback) */}
      {phase === 'ending' && (
        <div className="max-w-xl mx-auto animate-fade-in">
          <Card>
            <LoadingState message="Analyzing your interview and generating detailed feedback..." />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted">
                We're reviewing your transcript to score your performance across multiple dimensions.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'results' && summary && (
        <ResultsScreen
          summary={summary}
          meta={meta}
          company={meta.category === 'company' ? company : undefined}
          difficulty={difficulty}
          durationSeconds={seconds}
          onPracticeAgain={practiceAgain}
          onBack={() => navigate('/app/interviews')}
        />
      )}
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Results screen (inline)                                           */
/* ------------------------------------------------------------------ */

function ResultsScreen({
  summary,
  meta,
  company,
  difficulty,
  durationSeconds,
  onPracticeAgain,
  onBack,
}: {
  summary: SessionSummary;
  meta: InterviewTypeMeta;
  company?: string;
  difficulty: Difficulty;
  durationSeconds: number;
  onPracticeAgain: () => void;
  onBack: () => void;
}) {
  const score = summary.score;
  return (
    <div className="max-w-4xl mx-auto animate-slide-up space-y-6">
      {/* Hero score */}
      <Card className="relative overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', scoreBgClass(score))} />
        <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="text-center shrink-0">
            <div className={cn('font-display text-5xl sm:text-6xl font-bold', scoreColorClass(score))}>{score}</div>
            <p className="text-xs text-muted uppercase tracking-wide mt-1">Overall Score</p>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Trophy className={cn('h-5 w-5 shrink-0', scoreColorClass(score))} />
              <h2 className="font-display text-lg sm:text-xl font-bold text-main">
                {company ? `${company} Interview` : meta.title} — Results
              </h2>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Badge variant={difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'error'}>
                {difficulty}
              </Badge>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(durationSeconds)}
              </span>
            </div>
            <p className="text-sm text-muted mt-3 max-w-xl mx-auto sm:mx-0">{summary.summary}</p>
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

      {/* Key moments */}
      {summary.key_moments.length > 0 && (
        <Card>
          <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Key Moments
          </h3>
          <ul className="space-y-2">
            {summary.key_moments.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={onPracticeAgain} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Practice again
        </Button>
        <Button size="lg" variant="secondary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to interviews
        </Button>
      </div>
    </div>
  );
}
