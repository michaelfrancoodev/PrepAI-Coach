import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MessageSquare,
  Plane,
  Briefcase,
  Cpu,
  Coffee,
  Music,
  Utensils,
  Trophy,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Flag,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { ChatPanel } from '@/components/ChatPanel';
import { useAiChat } from '@/hooks/useAiChat';
import { useAuth } from '@/context/AuthContext';
import { useCreateSession, useUpdateSession, useMastery } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { callAi } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { PracticeSession, SessionMessage } from '@/lib/types';

type Phase = 'setup' | 'chat' | 'results';

interface TopicOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Plane;
  prompt: string;
}

const TOPICS: TopicOption[] = [
  { id: 'travel', label: 'Travel', description: 'Airports, hotels, asking directions, and trip stories.', icon: Plane, prompt: "Let's have a conversation about travel. Ask me about a recent or dream trip." },
  { id: 'work', label: 'Work', description: 'Meetings, emails, coworkers, and office situations.', icon: Briefcase, prompt: "Let's role-play a workplace conversation — maybe a meeting or a chat with a coworker." },
  { id: 'technology', label: 'Technology', description: 'Gadgets, apps, trends, and the digital world.', icon: Cpu, prompt: "Let's talk about technology. Ask me about a device or app I use often." },
  { id: 'daily-life', label: 'Daily Life', description: 'Routines, shopping, errands, and the little things.', icon: Coffee, prompt: "Let's talk about daily life. Ask me about my typical morning routine." },
  { id: 'hobbies', label: 'Hobbies', description: 'Pastimes, interests, and what you do for fun.', icon: Music, prompt: "Let's talk about hobbies. Ask me what I like to do in my free time." },
  { id: 'food', label: 'Food', description: 'Cooking, restaurants, cuisines, and favorites.', icon: Utensils, prompt: "Let's have a conversation about food. Ask me about my favorite dish or restaurant." },
  { id: 'sports', label: 'Sports', description: 'Games, teams, fitness, and competition.', icon: Trophy, prompt: "Let's talk about sports. Ask me about a sport I enjoy playing or watching." },
];

interface SessionSummary {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  suggestions?: string[];
}

export function ConversationPage() {
  useDocumentTitle('English Conversation');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const { dailyPlan, recordPractice } = useMastery();

  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedTopic, setSelectedTopic] = useState<TopicOption | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [finishing, setFinishing] = useState(false);

  const sessionCreatedRef = useRef(false);
  const finalizedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const messagesRef = useRef<SessionMessage[]>([]);

  const ttsVoice = profile?.ai_settings?.voice;
  const ttsRate = profile?.ai_settings?.speed ?? 1;

  const { messages, loading, error, send, reset } = useAiChat({
    mode: 'english_conversation',
    systemContext: {
      english_level: profile?.experience_level ?? 'intermediate',
      topic: selectedTopic?.id,
      topic_label: selectedTopic?.label,
    },
    temperature: 0.7,
  });

  // Keep a ref of messages for unmount save
  useEffect(() => {
    messagesRef.current = messages as SessionMessage[];
  }, [messages]);

  // Cleanup: save transcript if session was started but not finalized
  useEffect(() => {
    return () => {
      if (sessionId && !finalizedRef.current && messagesRef.current.length > 0) {
        updateSession(sessionId, {
          status: 'abandoned',
          transcript: messagesRef.current,
          duration_seconds: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)),
          completed_at: new Date().toISOString(),
        });
      }
    };
  }, [sessionId, updateSession]);

  const startConversation = useCallback(
    async (topic: TopicOption) => {
      if (sessionCreatedRef.current) return;
      sessionCreatedRef.current = true;
      setSelectedTopic(topic);
      setPhase('chat');
      startTimeRef.current = Date.now();

      const session = await createSession({
        type: 'english',
        category: 'conversation',
        title: `English Conversation — ${topic.label}`,
      });
      if (session) setSessionId(session.id);

      // Kick off the conversation with the topic prompt
      await send(topic.prompt);
    },
    [createSession, send],
  );

  const handleSend = useCallback(
    (text: string) => {
      send(text);
    },
    [send],
  );

  const endSession = useCallback(async () => {
    if (!sessionId || finalizedRef.current) return;
    setFinishing(true);
    finalizedRef.current = true;
    const transcript = messagesRef.current;
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    let result: SessionSummary | null = null;
    try {
      const resp = await callAi<SessionSummary>({
        mode: 'session_summary',
        context: {
          type: 'english_conversation',
          topic: selectedTopic?.label,
          english_level: profile?.experience_level ?? 'intermediate',
          transcript,
        },
        temperature: 0.5,
      });
      result = resp.data ?? null;
      // Fallback if AI didn't return structured data
      if (!result || typeof result.score !== 'number') {
        result = {
          score: 70,
          strengths: ['Completed the full conversation'],
          weaknesses: ['Continue practicing to get a more detailed assessment'],
          feedback: resp.content,
        };
      }
    } catch {
      result = {
        score: 70,
        strengths: ['Completed the conversation practice'],
        weaknesses: ['Assessment unavailable — try ending the session again'],
        feedback: 'We could not generate a detailed summary this time. Your transcript was still saved.',
      };
    }

    setSummary(result);
    await updateSession(sessionId, {
      status: 'completed',
      score: result.score,
      feedback: result as unknown as PracticeSession['feedback'],
      transcript,
      duration_seconds: durationSeconds,
      completed_at: new Date().toISOString(),
    });

    // A free-form conversation isn't tied to one specific curriculum topic
    // the way a coding problem is — so we apply the result to whichever
    // English topic is currently active for this user (a due review, or
    // otherwise the next new topic in their sequence).
    const englishPlan = dailyPlan().perTrack.english;
    const activeTopic = englishPlan.dueReviews[0] ?? englishPlan.nextNewTopic;
    if (activeTopic) void recordPractice(activeTopic.id, result.score);

    setFinishing(false);
    setPhase('results');
  }, [sessionId, selectedTopic, profile, updateSession, dailyPlan, recordPractice]);

  const restart = useCallback(() => {
    reset();
    setSummary(null);
    setSessionId(null);
    setSelectedTopic(null);
    sessionCreatedRef.current = false;
    finalizedRef.current = false;
    setPhase('setup');
  }, [reset]);

  return (
    <AppLayout>
      <PageHeader
        title="Daily Conversation"
        description="Practice real-life English conversations. Use your voice or type — the AI coach adapts to your level."
        icon={<MessageSquare className="h-5 w-5" />}
        action={
          phase !== 'setup' ? (
            <Button variant="ghost" size="sm" onClick={restart} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              New topic
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/english')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          )
        }
      />

      {phase === 'setup' && (
        <div className="animate-fade-in">
          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl surface-2 border border-app flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-main">Pick a topic</h3>
                <p className="text-sm text-muted">Choose what you'd like to talk about. The coach will lead the conversation.</p>
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {TOPICS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => startConversation(t)}
                disabled={loading}
                className="group card p-5 text-left hover:shadow-md transition-all animate-slide-up disabled:opacity-60"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl surface-2 border border-app flex items-center justify-center shrink-0">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-semibold text-main">{t.label}</h4>
                      <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <div className="animate-fade-in grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="flex flex-col h-[60vh] lg:h-[70vh]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-app">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg surface-2 border border-app flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-main text-sm">
                      {selectedTopic?.label ?? 'Conversation'}
                    </p>
                    <p className="text-xs text-muted">Voice & text · auto-speak on</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={endSession}
                  loading={finishing}
                  leftIcon={!finishing ? <Flag className="h-4 w-4" /> : undefined}
                >
                  {finishing ? 'Scoring...' : 'End session'}
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatPanel
                  messages={messages}
                  loading={loading}
                  error={error}
                  onSend={handleSend}
                  voiceEnabled
                  autoSpeak
                  ttsVoice={ttsVoice}
                  ttsRate={ttsRate}
                  placeholder="Type or speak your reply..."
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-main mb-3">Session tips</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <Mic className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Tap the mic to speak. The AI will read its replies aloud.</span>
                </li>
                <li className="flex gap-2">
                  <Lightbulb className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                  <span>Don't worry about mistakes — the coach gently corrects as you go.</span>
                </li>
                <li className="flex gap-2">
                  <Flag className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                  <span>Hit <span className="font-medium text-main">End session</span> when you're done to get your score.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <h3 className="font-display font-semibold text-main mb-2">Your level</h3>
              <Badge variant="primary" className="capitalize">{profile?.experience_level ?? 'intermediate'}</Badge>
              <p className="text-xs text-muted mt-3">The coach adjusts vocabulary and pace to match your level.</p>
            </Card>
          </div>
        </div>
      )}

      {phase === 'results' && summary && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <ResultsView summary={summary} topicLabel={selectedTopic?.label} onRestart={restart} onBack={() => navigate('/app/english')} />
        </div>
      )}

      {phase === 'results' && !summary && finishing && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted">Generating your assessment...</p>
        </div>
      )}
    </AppLayout>
  );
}

function ResultsView({
  summary,
  topicLabel,
  onRestart,
  onBack,
}: {
  summary: SessionSummary;
  topicLabel?: string;
  onRestart: () => void;
  onBack: () => void;
}) {
  const scoreColor =
    summary.score >= 80 ? 'text-success-500' : summary.score >= 60 ? 'text-warning-500' : 'text-error-500';
  const progressColor = summary.score >= 80 ? 'success' : summary.score >= 60 ? 'warning' : 'error';

  return (
    <>
      <Card className="mb-6 text-center relative overflow-hidden">
        <div className="relative">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl surface-2 border border-app mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-main">Session complete!</h2>
          {topicLabel && <p className="text-sm text-muted mt-1">Topic: {topicLabel}</p>}

          <div className="my-6">
            <p className={cn('font-display text-4xl sm:text-5xl font-bold', scoreColor)}>{summary.score}</p>
            <p className="text-sm text-muted">out of 100</p>
            <div className="mt-4 max-w-xs mx-auto">
              <Progress value={summary.score} color={progressColor} size="lg" showLabel />
            </div>
          </div>

          <p className="text-sm text-main leading-relaxed max-w-xl mx-auto">{summary.feedback}</p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-success-500" />
            <h3 className="font-display font-semibold text-main">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {summary.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-main">
                <span className="text-success-500 shrink-0">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-warning-500" />
            <h3 className="font-display font-semibold text-main">To improve</h3>
          </div>
          <ul className="space-y-2">
            {summary.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-main">
                <span className="text-warning-500 shrink-0">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {summary.suggestions && summary.suggestions.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-accent-500" />
            <h3 className="font-display font-semibold text-main">Suggested next steps</h3>
          </div>
          <ul className="space-y-2">
            {summary.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-main">
                <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRestart} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Practice again
        </Button>
        <Button variant="secondary" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to English
        </Button>
      </div>
    </>
  );
}

