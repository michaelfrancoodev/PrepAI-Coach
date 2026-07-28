import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Check,
  Volume2,
  Brain,
  RotateCcw,
  X,
  Plus,
  Award,
  Layers,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { ChatPanel } from '@/components/ChatPanel';
import { useAiChat } from '@/hooks/useAiChat';
import { useAuth } from '@/context/AuthContext';
import { useVocabulary } from '@/hooks/useData';
import { useSpeech } from '@/hooks/useSpeech';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { VocabularyItem } from '@/lib/types';

export function VocabularyPage() {
  useDocumentTitle('Vocabulary Builder');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { items: vocab, loading: vocabLoading, add: addWord, updateMastery, remove } = useVocabulary();
  const { speak, ttsSupported } = useSpeech();

  const ttsVoice = profile?.ai_settings?.voice;
  const ttsRate = profile?.ai_settings?.speed ?? 1;

  return (
    <AppLayout>
      <PageHeader
        title="Vocabulary Builder"
        description="Learn new words in context and review what you've saved with spaced practice."
        icon={<BookOpen className="h-5 w-5" />}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/english')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      <Tabs
        tabs={[
          {
            id: 'learn',
            label: (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Learn new words
              </span>
            ),
            content: (
              <LearnWords
                ttsVoice={ttsVoice}
                ttsRate={ttsRate}
                englishLevel={profile?.experience_level ?? 'intermediate'}
                onSaveWord={addWord}
                savedCount={vocab.length}
                speak={speak}
                ttsSupported={ttsSupported}
              />
            ),
          },
          {
            id: 'mine',
            label: (
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> My vocabulary
              </span>
            ),
            content: (
              <MyVocabulary
                items={vocab}
                loading={vocabLoading}
                onUpdateMastery={updateMastery}
                onRemove={remove}
                speak={speak}
                ttsSupported={ttsSupported}
                ttsVoice={ttsVoice}
                ttsRate={ttsRate}
              />
            ),
          },
        ]}
        defaultTab="learn"
      />
    </AppLayout>
  );
}

/* ----------------------------- Learn new words ----------------------------- */

interface ParsedWord {
  word: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
}

function LearnWords({
  ttsVoice,
  ttsRate,
  englishLevel,
  onSaveWord,
  savedCount,
  speak,
  ttsSupported,
}: {
  ttsVoice?: string;
  ttsRate: number;
  englishLevel: string;
  onSaveWord: (word: string, definition: string, example?: string, partOfSpeech?: string) => void;
  savedCount: number;
  speak: (text: string, opts?: { voice?: string; rate?: number }) => void;
  ttsSupported: boolean;
}) {
  const { messages, loading, error, send, reset } = useAiChat({
    mode: 'english_vocabulary',
    systemContext: {
      english_level: englishLevel,
      instruction: 'Introduce one new useful English word at a time with definition, part of speech, and an example sentence.',
    },
    temperature: 0.6,
  });

  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  const startLearning = useCallback(() => {
    reset();
    setSavedWords(new Set());
    send("Please introduce a new useful English word I might not know. Include the word, part of speech, a clear definition, and an example sentence. Format the word in **bold**.");
  }, [reset, send]);

  const nextWord = useCallback(() => {
    send("Great, now introduce another new word, same format please.");
  }, [send]);

  // Parse the most recent assistant message for a word to enable the Save button.
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].content;
    }
    return null;
  }, [messages]);

  const parsedWord = useMemo<ParsedWord | null>(() => {
    if (!lastAssistant) return null;
    const boldMatch = lastAssistant.match(/\*\*([^*]+)\*\*/);
    const word = boldMatch?.[1]?.trim();
    if (!word) return null;
    const posMatch = lastAssistant.match(/\(([^)]+)\)|\b(noun|verb|adjective|adverb|preposition|conjunction)\b/i);
    const defMatch = lastAssistant.match(/defin(?:ition|es)[^:]*:\s*([^\n]+)/i) ?? lastAssistant.match(/means[^:]*:\s*([^\n]+)/i);
    const exMatch = lastAssistant.match(/example[^:]*:\s*([^\n]+)/i) ?? lastAssistant.match(/"([^"]{10,})"/);
    return {
      word,
      partOfSpeech: posMatch?.[1]?.trim(),
      definition: defMatch?.[1]?.trim(),
      example: exMatch?.[1]?.trim(),
    };
  }, [lastAssistant]);

  const handleSave = useCallback(() => {
    if (!parsedWord) return;
    onSaveWord(
      parsedWord.word,
      parsedWord.definition ?? lastAssistant ?? '',
      parsedWord.example,
      parsedWord.partOfSpeech,
    );
    setSavedWords((prev) => new Set(prev).add(parsedWord.word.toLowerCase()));
  }, [parsedWord, lastAssistant, onSaveWord]);

  const isSaved = parsedWord ? savedWords.has(parsedWord.word.toLowerCase()) : false;

  return (
    <div className="animate-fade-in grid lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <Card className="flex flex-col h-[55vh] lg:h-[65vh]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-app">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg surface-2 border border-app flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-main text-sm">Word coach</p>
                <p className="text-xs text-muted">One new word at a time, with context</p>
              </div>
            </div>
            {messages.length === 0 ? (
              <Button size="sm" onClick={startLearning} loading={loading} leftIcon={<Sparkles className="h-4 w-4" />}>
                Start
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={nextWord} loading={loading} leftIcon={<ArrowRight className="h-4 w-4" />}>
                Next word
              </Button>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              loading={loading}
              error={error}
              onSend={send}
              voiceEnabled
              autoSpeak
              ttsVoice={ttsVoice}
              ttsRate={ttsRate}
              placeholder="Ask for another word or a usage question..."
            />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Save current word */}
        <Card>
          <h3 className="font-display font-semibold text-main mb-3">Current word</h3>
          {parsedWord ? (
            <div className="space-y-3">
              <div className="rounded-xl surface-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-main">{parsedWord.word}</p>
                    {parsedWord.partOfSpeech && (
                      <Badge variant="accent" className="mt-1 capitalize">{parsedWord.partOfSpeech}</Badge>
                    )}
                  </div>
                  {ttsSupported && (
                    <button
                      onClick={() => speak(parsedWord.word, { voice: ttsVoice, rate: ttsRate })}
                      className="btn-secondary !h-11 !w-11 shrink-0"
                      title="Pronounce word"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {parsedWord.definition && (
                  <p className="text-sm text-muted mt-2 leading-relaxed">{parsedWord.definition}</p>
                )}
                {parsedWord.example && (
                  <p className="text-sm text-main mt-2 italic border-l-2 border-app pl-3">"{parsedWord.example}"</p>
                )}
              </div>
              <Button
                className="w-full"
                variant={isSaved ? 'secondary' : 'primary'}
                onClick={handleSave}
                disabled={isSaved}
                leftIcon={isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              >
                {isSaved ? 'Saved to vocabulary' : 'Save word'}
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8" />}
              title="No word yet"
              description="Start the coach to learn your first word. Tap Start above."
            />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-main">Saved total</h3>
            <Badge variant="success">{savedCount}</Badge>
          </div>
          <p className="text-xs text-muted">
            Switch to "My vocabulary" to review everything you've saved and track mastery.
          </p>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl surface-2 border border-app flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-main text-sm">Learning tip</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Save words as you learn them, then use the Review mode to reinforce them. Repetition builds long-term recall.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------ My vocabulary ------------------------------ */

type ReviewState = 'idle' | 'active' | 'done';

function MyVocabulary({
  items,
  loading,
  onUpdateMastery,
  onRemove,
  speak,
  ttsSupported,
  ttsVoice,
  ttsRate,
}: {
  items: VocabularyItem[];
  loading: boolean;
  onUpdateMastery: (id: string, mastery: number) => void;
  onRemove: (id: string) => void;
  speak: (text: string, opts?: { voice?: string; rate?: number }) => void;
  ttsSupported: boolean;
  ttsVoice?: string;
  ttsRate: number;
}) {
  const [reviewState, setReviewState] = useState<ReviewState>('idle');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);

  const avgMastery = items.length
    ? Math.round(items.reduce((acc, v) => acc + v.mastery, 0) / items.length)
    : 0;

  const masteredCount = items.filter((v) => v.mastery >= 100).length;
  const learningCount = items.filter((v) => v.mastery > 0 && v.mastery < 100).length;
  const newCount = items.filter((v) => v.mastery === 0).length;

  const reviewQueue = useMemo(() => {
    // Prioritize least-mastered words first
    return [...items].sort((a, b) => a.mastery - b.mastery).slice(0, 10);
  }, [items]);

  const currentReview = reviewQueue[reviewIndex];

  const startReview = useCallback(() => {
    if (items.length === 0) return;
    setReviewIndex(0);
    setRevealed(false);
    setReviewScore(0);
    setReviewState('active');
  }, [items.length]);

  const answerReview = useCallback(
    (knewIt: boolean) => {
      if (!currentReview) return;
      const delta = knewIt ? 20 : -10;
      const nextMastery = Math.min(100, Math.max(0, currentReview.mastery + delta));
      onUpdateMastery(currentReview.id, nextMastery);
      if (knewIt) setReviewScore((s) => s + 1);

      if (reviewIndex + 1 >= reviewQueue.length) {
        setReviewState('done');
      } else {
        setReviewIndex((i) => i + 1);
        setRevealed(false);
      }
    },
    [currentReview, onUpdateMastery, reviewIndex, reviewQueue.length],
  );

  const exitReview = useCallback(() => {
    setReviewState('idle');
    setReviewIndex(0);
    setRevealed(false);
  }, []);

  if (loading) {
    return <LoadingState message="Loading your vocabulary..." />;
  }

  if (items.length === 0 && reviewState !== 'active') {
    return (
      <EmptyState
        icon={<BookOpen className="h-10 w-10" />}
        title="No words saved yet"
        description="Head to the 'Learn new words' tab to start building your vocabulary. Saved words appear here with mastery tracking."
      />
    );
  }

  // Review complete screen
  if (reviewState === 'done') {
    return (
      <Card className="text-center relative overflow-hidden">
        <div className="relative">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl surface-2 border border-app mb-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-main">Review complete!</h2>
          <p className="text-sm text-muted mt-1">
            You got {reviewScore} of {reviewQueue.length} right
          </p>
          <div className="mt-4 max-w-xs mx-auto">
            <Progress value={reviewScore} max={reviewQueue.length} color="success" size="lg" showLabel />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button onClick={startReview} leftIcon={<RotateCcw className="h-4 w-4" />}>
              Review again
            </Button>
            <Button variant="secondary" onClick={exitReview} leftIcon={<BookOpen className="h-4 w-4" />}>
              Back to list
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Active review screen
  if (reviewState === 'active' && currentReview) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-main">Review mode</h3>
            <Badge variant="primary">{reviewIndex + 1} / {reviewQueue.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={exitReview} leftIcon={<X className="h-4 w-4" />}>
            Exit
          </Button>
        </div>

        <Progress value={reviewIndex} max={reviewQueue.length} color="primary" className="mb-6" />

        <Card className="max-w-2xl mx-auto text-center relative overflow-hidden">
          <div className="relative">
            <p className="text-xs text-muted uppercase tracking-wide mb-3">Do you know this word?</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-main mb-4">{currentReview.word}</p>

            {ttsSupported && (
              <button
                onClick={() => speak(currentReview.word, { voice: ttsVoice, rate: ttsRate })}
                className="btn-secondary !px-4 !py-2.5 mb-4"
                title="Hear pronunciation"
              >
                <Volume2 className="h-4 w-4 inline mr-1" /> Pronounce
              </button>
            )}

            {revealed ? (
              <div className="animate-fade-in text-left mt-4 rounded-xl surface-2 p-4 space-y-2">
                {currentReview.part_of_speech && (
                  <Badge variant="accent" className="capitalize">{currentReview.part_of_speech}</Badge>
                )}
                {currentReview.definition && (
                  <p className="text-sm text-main leading-relaxed">{currentReview.definition}</p>
                )}
                {currentReview.example && (
                  <p className="text-sm text-muted italic border-l-2 border-app pl-3">"{currentReview.example}"</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted mt-2">Tap reveal to see the definition, then rate yourself.</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              {!revealed ? (
                <Button onClick={() => setRevealed(true)} leftIcon={<Sparkles className="h-4 w-4" />}>
                  Reveal definition
                </Button>
              ) : (
                <>
                  <Button variant="danger" onClick={() => answerReview(false)} leftIcon={<X className="h-4 w-4" />}>
                    Didn't know
                  </Button>
                  <Button variant="primary" onClick={() => answerReview(true)} leftIcon={<Check className="h-4 w-4" />}>
                    Knew it
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Default: word list
  return (
    <div className="animate-fade-in">
      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="!p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Total words</p>
          <p className="font-display text-xl sm:text-2xl font-bold text-main">{items.length}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Avg mastery</p>
          <p className="font-display text-xl sm:text-2xl font-bold text-success-500">{avgMastery}%</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Mastered</p>
          <p className="font-display text-xl sm:text-2xl font-bold text-brand-500">{masteredCount}</p>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">Learning</p>
          <p className="font-display text-xl sm:text-2xl font-bold text-accent-500">{learningCount + newCount}</p>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-main">Your words</h3>
        <Button onClick={startReview} disabled={items.length === 0} leftIcon={<Brain className="h-4 w-4" />}>
          Start review
        </Button>
      </div>

      {/* Mastery breakdown bar */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-primary" />
          <h4 className="font-display font-semibold text-main text-sm">Mastery breakdown</h4>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <MasteryBucket label="New" count={newCount} total={items.length} color="accent" />
          <MasteryBucket label="Learning" count={learningCount} total={items.length} color="warning" />
          <MasteryBucket label="Mastered" count={masteredCount} total={items.length} color="success" />
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-8 w-8" />}
          title="No words yet"
          description="Learn new words in the Learn tab and save them here."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((v, i) => (
            <WordCard
              key={v.id}
              item={v}
              index={i}
              speak={speak}
              ttsSupported={ttsSupported}
              ttsVoice={ttsVoice}
              ttsRate={ttsRate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MasteryBucket({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: 'accent' | 'warning' | 'success';
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-semibold text-main">{count}</span>
      </div>
      <Progress value={pct} color={color} size="sm" showLabel />
    </div>
  );
}

function WordCard({
  item,
  index,
  speak,
  ttsSupported,
  ttsVoice,
  ttsRate,
  onRemove,
}: {
  item: VocabularyItem;
  index: number;
  speak: (text: string, opts?: { voice?: string; rate?: number }) => void;
  ttsSupported: boolean;
  ttsVoice?: string;
  ttsRate: number;
  onRemove: (id: string) => void;
}) {
  const masteryColor: 'success' | 'warning' | 'accent' =
    item.mastery >= 100 ? 'success' : item.mastery > 0 ? 'warning' : 'accent';

  return (
    <Card className="animate-slide-up" hover style={{ animationDelay: `${index * 30}ms` }}>
      <div className="h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-lg font-bold text-main truncate">{item.word}</p>
              {ttsSupported && (
                <button
                  onClick={() => speak(item.word, { voice: ttsVoice, rate: ttsRate })}
                  className="btn-ghost !h-9 !w-9 text-muted hover:text-primary shrink-0"
                  title="Pronounce"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {item.part_of_speech && (
              <Badge variant="accent" className="mt-1 capitalize">{item.part_of_speech}</Badge>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="btn-ghost !h-9 !w-9 text-muted hover:text-error-500 shrink-0"
            title="Remove word"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {item.definition && (
          <p className="text-sm text-muted leading-relaxed mb-2">{item.definition}</p>
        )}
        {item.example && (
          <p className="text-sm text-main italic border-l-2 border-app pl-3 mb-3">"{item.example}"</p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted">Mastery</span>
            <span className="text-xs font-semibold text-main">{item.mastery}%</span>
          </div>
          <Progress value={item.mastery} color={masteryColor} size="sm" />
        </div>
      </div>
    </Card>
  );
}
