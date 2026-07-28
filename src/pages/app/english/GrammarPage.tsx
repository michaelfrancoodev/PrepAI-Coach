import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Layers,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Flag,
  Loader2,
  RotateCcw,
  Save,
  Plus,
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
import { useCreateSession, useUpdateSession, useMistakes } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { callAi } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { PracticeSession, SessionMessage } from '@/lib/types';

type Phase = 'setup' | 'chat' | 'results';

interface GrammarArea {
  id: string;
  label: string;
  description: string;
  icon: typeof Clock;
  prompt: string;
}

const AREAS: GrammarArea[] = [
  { id: 'tenses', label: 'Tenses', description: 'Past, present, future, and perfect forms.', icon: Clock, prompt: "Let's practice verb tenses. Give me a short exercise mixing past, present, and future forms." },
  { id: 'articles', label: 'Articles', description: 'a, an, the, and zero article rules.', icon: BookOpen, prompt: "Let's practice articles (a, an, the). Give me fill-in-the-blank sentences to complete." },
  { id: 'prepositions', label: 'Prepositions', description: 'in, on, at, by, and time/place prepositions.', icon: Layers, prompt: "Let's practice prepositions. Give me sentences where I choose the correct preposition." },
  { id: 'conditionals', label: 'Conditionals', description: 'If-clauses: zero, first, second, third.', icon: AlertCircle, prompt: "Let's practice conditionals. Give me scenarios and ask me to respond with the correct if-clause." },
  { id: 'modals', label: 'Modals', description: 'can, could, should, must, might, and more.', icon: Lightbulb, prompt: "Let's practice modal verbs. Give me situations and ask me to respond using the right modal." },
  { id: 'passives', label: 'Passives', description: 'Active to passive transformations.', icon: Layers, prompt: "Let's practice the passive voice. Give me active sentences to convert to passive." },
];

interface SessionSummary {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  suggestions?: string[];
  corrections?: { original: string; correction: string; rule: string }[];
}

export function GrammarPage() {
  useDocumentTitle('Grammar Practice');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const { items: mistakes, add: addMistake } = useMistakes();

  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedArea, setSelectedArea] = useState<GrammarArea | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [savedMistakeIds, setSavedMistakeIds] = useState<Set<string>>(new Set());

  const sessionCreatedRef = useRef(false);
  const finalizedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const messagesRef = useRef<SessionMessage[]>([]);

  const ttsVoice = profile?.ai_settings?.voice;
  const ttsRate = profile?.ai_settings?.speed ?? 1;

  const { messages, loading, error, send, reset } = useAiChat({
    mode: 'english_grammar',
    systemContext: {
      english_level: profile?.experience_level ?? 'intermediate',
      grammar_area: selectedArea?.id,
      grammar_label: selectedArea?.label,
    },
    temperature: 0.5,
  });

  useEffect(() => {
    messagesRef.current = messages as SessionMessage[];
  }, [messages]);

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

  const startPractice = useCallback(
    async (area: GrammarArea) => {
      if (sessionCreatedRef.current) return;
      sessionCreatedRef.current = true;
      setSelectedArea(area);
      setPhase('chat');
      startTimeRef.current = Date.now();

      const session = await createSession({
        type: 'english',
        category: 'grammar',
        title: `Grammar Practice — ${area.label}`,
      });
      if (session) setSessionId(session.id);

      await send(area.prompt);
    },
    [createSession, send],
  );

  const handleSend = useCallback(
    (text: string) => {
      send(text);
    },
    [send],
  );

  // Derive candidate corrections from the conversation: pair each user message
  // with the following assistant reply (which may contain a correction).
  const candidateCorrections = (() => {
    const pairs: { id: string; userText: string; assistantText: string }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user' && messages[i + 1]?.role === 'assistant') {
        pairs.push({
          id: `msg-${i}`,
          userText: messages[i].content,
          assistantText: messages[i + 1].content,
        });
      }
    }
    return pairs;
  })();

  const handleSaveMistake = useCallback(
    (pair: { id: string; userText: string; assistantText: string }) => {
      addMistake({
        category: 'english',
        prompt: selectedArea?.label ?? 'Grammar practice',
        user_answer: pair.userText,
        correction: pair.assistantText,
        explanation: selectedArea?.label ?? null,
      });
      setSavedMistakeIds((prev) => new Set(prev).add(pair.id));
    },
    [addMistake, selectedArea],
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
          type: 'english_grammar',
          grammar_area: selectedArea?.label,
          english_level: profile?.experience_level ?? 'intermediate',
          transcript,
        },
        temperature: 0.5,
      });
      result = resp.data ?? null;
      if (!result || typeof result.score !== 'number') {
        result = {
          score: 70,
          strengths: ['Completed the grammar drill'],
          weaknesses: ['Keep practicing for a more detailed assessment'],
          feedback: resp.content,
        };
      }
    } catch {
      result = {
        score: 70,
        strengths: ['Completed the grammar practice'],
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
    setFinishing(false);
    setPhase('results');
  }, [sessionId, selectedArea, profile, updateSession]);

  const restart = useCallback(() => {
    reset();
    setSummary(null);
    setSessionId(null);
    setSelectedArea(null);
    setSavedMistakeIds(new Set());
    sessionCreatedRef.current = false;
    finalizedRef.current = false;
    setPhase('setup');
  }, [reset]);

  return (
    <AppLayout>
      <PageHeader
        title="Grammar Practice"
        description="Targeted grammar drills with instant corrections. Save your mistakes to review later."
        icon={<BookOpen className="h-5 w-5" />}
        action={
          phase !== 'setup' ? (
            <Button variant="ghost" size="sm" onClick={restart} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              New area
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
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-main">Choose a grammar area</h3>
                <p className="text-sm text-muted">Each drill gives you exercises and corrects your answers in real time.</p>
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {AREAS.map((a, i) => (
              <button
                key={a.id}
                onClick={() => startPractice(a)}
                disabled={loading}
                className="group card p-5 text-left hover:shadow-md transition-all animate-slide-up disabled:opacity-60"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl surface-2 border border-app flex items-center justify-center shrink-0">
                    <a.icon className="h-5 w-5 text-accent-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-semibold text-main">{a.label}</h4>
                      <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <div className="animate-fade-in grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex flex-col h-[55vh] lg:h-[60vh]">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-app">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg surface-2 border border-app flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-main text-sm">{selectedArea?.label ?? 'Grammar'}</p>
                    <p className="text-xs text-muted">Exercises with live corrections</p>
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
                  placeholder="Type your answer..."
                />
              </div>
            </Card>

            {/* Save mistakes panel */}
            {candidateCorrections.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Save className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold text-main text-sm">Save corrections as mistakes</h3>
                  <Badge variant="primary">{candidateCorrections.length}</Badge>
                </div>
                <p className="text-xs text-muted mb-3">
                  Review your answers below. Save any that the coach corrected so you can study them later.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto code-scroll pr-1">
                  {candidateCorrections.map((pair) => {
                    const saved = savedMistakeIds.has(pair.id);
                    return (
                      <div key={pair.id} className="rounded-xl surface-2 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs text-muted">You said:</p>
                            <p className="text-sm text-main line-clamp-2">{pair.userText}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={saved ? 'secondary' : 'primary'}
                            onClick={() => handleSaveMistake(pair)}
                            disabled={saved}
                            leftIcon={saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                          >
                            {saved ? 'Saved' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-display font-semibold text-main mb-3">How it works</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <BookOpen className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                  <span>The coach gives you exercises for the selected grammar area.</span>
                </li>
                <li className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-warning-500 shrink-0 mt-0.5" />
                  <span>Each answer is corrected with an explanation of the rule.</span>
                </li>
                <li className="flex gap-2">
                  <Save className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Save corrections to build your personal mistake journal.</span>
                </li>
                <li className="flex gap-2">
                  <Flag className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                  <span>End the session to get a scored grammar assessment.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-main">Saved mistakes</h3>
                <Badge variant="accent">{mistakes.filter((m) => m.category === 'english').length}</Badge>
              </div>
              <p className="text-xs text-muted">
                Find all your saved grammar mistakes in the English report under "Common mistakes".
              </p>
            </Card>
          </div>
        </div>
      )}

      {phase === 'results' && summary && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <ResultsView
            summary={summary}
            areaLabel={selectedArea?.label}
            savedCount={savedMistakeIds.size}
            onRestart={restart}
            onBack={() => navigate('/app/english')}
          />
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
  areaLabel,
  savedCount,
  onRestart,
  onBack,
}: {
  summary: SessionSummary;
  areaLabel?: string;
  savedCount: number;
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
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-main">Grammar drill complete!</h2>
          {areaLabel && <p className="text-sm text-muted mt-1">Area: {areaLabel}</p>}

          <div className="my-6">
            <p className={cn('font-display text-4xl sm:text-5xl font-bold', scoreColor)}>{summary.score}</p>
            <p className="text-sm text-muted">out of 100</p>
            <div className="mt-4 max-w-xs mx-auto">
              <Progress value={summary.score} color={progressColor} size="lg" showLabel />
            </div>
          </div>

          <p className="text-sm text-main leading-relaxed max-w-xl mx-auto">{summary.feedback}</p>

          {savedCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted">
              <Save className="h-3.5 w-3.5 text-primary" />
              <span>{savedCount} correction{savedCount === 1 ? '' : 's'} saved to your mistake journal</span>
            </div>
          )}
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
                <Plus className="h-4 w-4 text-primary shrink-0 mt-0.5" />
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
