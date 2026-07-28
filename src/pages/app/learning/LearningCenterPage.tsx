import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Layers,
  Repeat2,
  BookOpen,
  AlertTriangle,
  Bookmark,
  Bot,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Mic,
  Users,
  Code2,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { Tabs } from '@/components/ui/Tabs';
import { ChatPanel } from '@/components/ChatPanel';
import { useAuth } from '@/context/AuthContext';
import {
  useFlashcards,
  useVocabulary,
  useMistakes,
  useBookmarks,
  useMastery,
} from '@/hooks/useData';
import { useAiChat } from '@/hooks/useAiChat';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo, relativeDate, groupBy } from '@/lib/utils';
import type { MasteryTrack, TopicWithMastery } from '@/lib/types';

const TRACK_META: Record<MasteryTrack, { label: string; icon: typeof Mic }> = {
  english: { label: 'English', icon: Mic },
  coding: { label: 'Coding', icon: Code2 },
  interview: { label: 'Interviews', icon: Users },
};

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function LearningCenterPage() {
  useDocumentTitle('Learning Center');
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { topicsWithMastery, loading: masteryLoading } = useMastery();
  const flashcards = useFlashcards();
  const vocabulary = useVocabulary();
  const mistakes = useMistakes();
  const bookmarks = useBookmarks();

  /* AI tutor chat */
  const tutorChat = useAiChat({
    mode: 'coach_ask',
    systemContext: useMemo(
      () => ({
        display_name: profile?.display_name,
        experience_level: profile?.experience_level,
        goals: profile?.goals,
        target_role: profile?.target_role,
      }),
      [profile],
    ),
    temperature: 0.7,
  });

  const tabs = [
    { id: 'curriculum', label: 'Curriculum', content: <CurriculumTab topicsWithMastery={topicsWithMastery} loading={masteryLoading} navigate={navigate} /> },
    { id: 'flashcards', label: 'Flashcards', content: <FlashcardsTab hook={flashcards} /> },
    { id: 'vocabulary', label: 'Vocabulary', content: <VocabularyTab hook={vocabulary} /> },
    { id: 'mistakes', label: 'Mistakes', content: <MistakesTab hook={mistakes} /> },
    { id: 'bookmarks', label: 'Bookmarks', content: <BookmarksTab hook={bookmarks} /> },
    { id: 'tutor', label: 'AI Tutor', content: <TutorTab chat={tutorChat} /> },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Learning Center"
        description="Your full curriculum, step by step — plus flashcards, vocabulary, mistakes, and bookmarks."
        icon={<GraduationCap className="h-5 w-5" />}
        action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/coach/ask')} leftIcon={<Sparkles className="h-4 w-4" />}>
            Ask Coach
          </Button>
        }
      />

      <Tabs tabs={tabs} defaultTab="curriculum" />
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Curriculum tab — the full 0->100 path, per track, with locking       */
/* ------------------------------------------------------------------ */

function CurriculumTab({
  topicsWithMastery,
  loading,
  navigate,
}: {
  topicsWithMastery: (track?: MasteryTrack) => TopicWithMastery[];
  loading: boolean;
  navigate: (path: string) => void;
}) {
  const [activeTrack, setActiveTrack] = useState<MasteryTrack>('english');

  if (loading) return <LoadingState message="Loading your curriculum..." />;

  const topics = topicsWithMastery(activeTrack);
  const levels: TopicWithMastery['level'][] = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="space-y-6">
      {/* Track switcher */}
      <div className="flex items-center gap-2">
        {(Object.keys(TRACK_META) as MasteryTrack[]).map((t) => {
          const meta = TRACK_META[t];
          return (
            <button
              key={t}
              onClick={() => setActiveTrack(t)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium border transition-colors',
                activeTrack === t ? 'border-primary bg-primary/10 text-primary' : 'border-app surface text-muted hover:surface-2',
              )}
            >
              <meta.icon className="h-4 w-4" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {levels.map((level) => {
        const levelTopics = topics.filter((t) => t.level === level).sort((a, b) => a.order_index - b.order_index);
        if (levelTopics.length === 0) return null;
        const masteredCount = levelTopics.filter((t) => (t.mastery?.score ?? 0) >= 70).length;

        return (
          <Card key={level}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-main capitalize">{level}</h3>
              <span className="text-xs text-muted">{masteredCount}/{levelTopics.length} mastered</span>
            </div>
            <Progress value={Math.round((masteredCount / levelTopics.length) * 100)} size="sm" className="mb-4" />
            <div className="space-y-1.5">
              {levelTopics.map((topic) => {
                const score = topic.mastery?.score ?? 0;
                const mastered = score >= 70;
                return (
                  <button
                    key={topic.id}
                    disabled={topic.locked}
                    onClick={() => navigate(`/app/learning/topic/${topic.slug}`)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md border p-3 text-left transition-colors',
                      topic.locked
                        ? 'border-app surface-2 opacity-60 cursor-not-allowed'
                        : mastered
                          ? 'border-success-500/30 bg-success-500/5 hover:surface-2'
                          : 'border-app surface hover:surface-2',
                    )}
                  >
                    <div className="h-8 w-8 rounded shrink-0 flex items-center justify-center surface-2 border border-app">
                      {topic.locked ? (
                        <Lock className="h-3.5 w-3.5 text-muted" />
                      ) : mastered ? (
                        <CheckCircle2 className="h-4 w-4 text-success-500" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{topic.order_index}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{topic.title}</p>
                      <p className="text-xs text-muted truncate">
                        {topic.locked ? 'Complete the topic before this one to unlock' : topic.description}
                      </p>
                    </div>
                    {!topic.locked && <span className="text-xs text-muted shrink-0">{score}/100</span>}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flashcards tab                                                     */
/* ------------------------------------------------------------------ */

type FlashcardsHook = ReturnType<typeof useFlashcards>;

function FlashcardsTab({ hook }: { hook: FlashcardsHook }) {
  const { cards, loading, add, review, remove } = hook;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const dueCards = cards.filter((c) => c.next_review <= today);
  const otherCards = cards.filter((c) => c.next_review > today);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) return;
    await add(front.trim(), back.trim());
    setFront('');
    setBack('');
  };

  if (loading) return <LoadingState message="Loading flashcards..." />;

  return (
    <div className="space-y-6">
      {/* Add card form */}
      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Add a flashcard
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Front (question)" value={front} onChange={(e) => setFront(e.target.value)} placeholder="e.g. What is the time complexity of binary search?" />
          <Input label="Back (answer)" value={back} onChange={(e) => setBack(e.target.value)} placeholder="e.g. O(log n)" />
        </div>
        <Button className="mt-3" size="sm" onClick={handleAdd} disabled={!front.trim() || !back.trim()} leftIcon={<Plus className="h-4 w-4" />}>
          Add card
        </Button>
      </Card>

      {/* Due cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-main flex items-center gap-2">
            <Repeat2 className="h-4 w-4 text-warning-500" />
            Due for review
          </h3>
          <Badge variant="warning">{dueCards.length} due</Badge>
        </div>
        {dueCards.length === 0 ? (
          <EmptyState icon={<CheckCircle2 className="h-8 w-8" />} title="All caught up!" description="No flashcards are due right now. Add new cards or come back later." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {dueCards.map((card) => (
              <FlashcardItem
                key={card.id}
                card={card}
                flipped={flippedId === card.id}
                onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)}
                onReview={(q) => { void review(card.id, q); setFlippedId(null); }}
                onRemove={() => void remove(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other cards */}
      {otherCards.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            All cards ({otherCards.length})
          </h3>
          <div className="space-y-2">
            {otherCards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-main truncate">{card.front}</p>
                  <p className="text-xs text-muted truncate">{card.back}</p>
                </div>
                <Badge variant="success" className="shrink-0 whitespace-nowrap">Next: {relativeDate(card.next_review)}</Badge>
                <button onClick={() => void remove(card.id)} className="btn-ghost !p-2 shrink-0" title="Delete">
                  <Trash2 className="h-4 w-4 text-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardItem({
  card,
  flipped,
  onFlip,
  onReview,
  onRemove,
}: {
  card: { id: string; front: string; back: string; deck: string };
  flipped: boolean;
  onFlip: () => void;
  onReview: (quality: number) => void;
  onRemove: () => void;
}) {
  const reviewBtns: { label: string; quality: number; color: string }[] = [
    { label: 'Again', quality: 0, color: 'border-error-500 text-error-500 hover:bg-error-500/10' },
    { label: 'Hard', quality: 2, color: 'border-warning-500 text-warning-500 hover:bg-warning-500/10' },
    { label: 'Good', quality: 4, color: 'border-primary text-primary hover:bg-primary/10' },
    { label: 'Easy', quality: 5, color: 'border-success-500 text-success-500 hover:bg-success-500/10' },
  ];
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="accent">{card.deck}</Badge>
        <button onClick={onRemove} className="btn-ghost !p-1.5 shrink-0" title="Delete">
          <Trash2 className="h-3.5 w-3.5 text-muted" />
        </button>
      </div>
      <button onClick={onFlip} className="w-full text-left rounded-xl surface-2 p-4 min-h-[100px] flex flex-col justify-center transition-all hover:surface">
        {flipped ? (
          <>
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Answer</p>
            <p className="text-sm font-medium text-main whitespace-pre-wrap">{card.back}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Question</p>
            <p className="text-sm font-medium text-main whitespace-pre-wrap">{card.front}</p>
          </>
        )}
      </button>
      {flipped ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {reviewBtns.map((b) => (
            <button
              key={b.label}
              onClick={() => onReview(b.quality)}
              className={cn('rounded-lg border py-2 text-xs font-semibold transition-all', b.color)}
            >
              {b.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted text-center">Click the card to flip and reveal the answer</p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Vocabulary tab                                                     */
/* ------------------------------------------------------------------ */

type VocabHook = ReturnType<typeof useVocabulary>;

function VocabularyTab({ hook }: { hook: VocabHook }) {
  const { items, loading, add, updateMastery, remove } = hook;
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');

  const handleAdd = async () => {
    if (!word.trim() || !definition.trim()) return;
    await add(word.trim(), definition.trim(), example.trim() || undefined);
    setWord('');
    setDefinition('');
    setExample('');
  };

  if (loading) return <LoadingState message="Loading vocabulary..." />;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Add a word
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Word" value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. ephemeral" />
          <Input label="Definition" value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="e.g. lasting for a very short time" />
        </div>
        <div className="mt-3">
          <Textarea label="Example sentence (optional)" value={example} onChange={(e) => setExample(e.target.value)} placeholder="e.g. The ephemeral nature of social media trends..." className="min-h-[70px]" />
        </div>
        <Button className="mt-3" size="sm" onClick={handleAdd} disabled={!word.trim() || !definition.trim()} leftIcon={<Plus className="h-4 w-4" />}>
          Add word
        </Button>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-10 w-10" />} title="No vocabulary yet" description="Save new words you encounter to build your personal dictionary." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="!p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-display font-semibold text-main break-words">{item.word}</h4>
                  {item.part_of_speech && <Badge variant="default" className="mt-1">{item.part_of_speech}</Badge>}
                </div>
                <button onClick={() => void remove(item.id)} className="btn-ghost !p-1.5 shrink-0" title="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-muted" />
                </button>
              </div>
              {item.definition && <p className="text-sm text-muted mb-2">{item.definition}</p>}
              {item.example && (
                <p className="text-xs text-muted italic border-l-2 border-app pl-2 mb-3">"{item.example}"</p>
              )}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-muted">Mastery</span>
                <span className="text-xs font-medium text-main">{item.mastery}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={item.mastery} max={5} color={item.mastery >= 4 ? 'success' : item.mastery >= 2 ? 'warning' : 'error'} size="sm" className="flex-1" />
                <button
                  onClick={() => void updateMastery(item.id, Math.min(5, item.mastery + 1))}
                  className="btn-ghost !p-1.5 shrink-0"
                  title="Increase mastery"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
                </button>
              </div>
              {item.last_reviewed_at && <p className="text-xs text-muted mt-2">Reviewed {timeAgo(item.last_reviewed_at)}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mistakes tab                                                       */
/* ------------------------------------------------------------------ */

type MistakesHook = ReturnType<typeof useMistakes>;

function MistakesTab({ hook }: { hook: MistakesHook }) {
  const { items, loading, markReviewed, remove } = hook;
  if (loading) return <LoadingState message="Loading mistakes..." />;
  if (items.length === 0) {
    return <EmptyState icon={<AlertTriangle className="h-10 w-10" />} title="No mistakes logged" description="Mistakes from your practice sessions will appear here so you can learn from them." />;
  }
  const groups = groupBy(items, (m) => m.category);
  const unreviewed = items.filter((m) => !m.reviewed);

  return (
    <div className="space-y-6">
      {unreviewed.length > 0 && (
        <div className="rounded-xl border border-warning-500/20 bg-warning-500/5 p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning-500" />
          <span className="text-sm text-muted">{unreviewed.length} unreviewed mistake{unreviewed.length > 1 ? 's' : ''}</span>
        </div>
      )}
      {Object.entries(groups).map(([category, group]) => (
        <Card key={category}>
          <h3 className="font-display font-semibold text-main mb-3 capitalize flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning-500" />
            {category.replace(/_/g, ' ')}
            <Badge variant="default">{group.length}</Badge>
          </h3>
          <div className="space-y-3">
            {group.map((m) => (
              <div key={m.id} className={cn('rounded-xl border p-3', m.reviewed ? 'border-app surface-2 opacity-70' : 'border-warning-500/20 bg-warning-500/5')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    {m.prompt && <p className="text-xs text-muted">Prompt: {m.prompt}</p>}
                    {m.user_answer && <p className="text-sm text-error-600 dark:text-error-400">You said: {m.user_answer}</p>}
                    {m.correction && <p className="text-sm text-success-600 dark:text-success-400">Correct: {m.correction}</p>}
                    {m.explanation && <p className="text-xs text-muted mt-1">{m.explanation}</p>}
                    <p className="text-xs text-muted mt-1">{timeAgo(m.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!m.reviewed && (
                      <button onClick={() => void markReviewed(m.id)} className="btn-ghost !p-1.5" title="Mark reviewed">
                        <CheckCircle2 className="h-4 w-4 text-success-500" />
                      </button>
                    )}
                    <button onClick={() => void remove(m.id)} className="btn-ghost !p-1.5" title="Delete">
                      <Trash2 className="h-4 w-4 text-muted" />
                    </button>
                  </div>
                </div>
                {m.reviewed && <Badge variant="success" className="mt-2">Reviewed</Badge>}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bookmarks tab                                                      */
/* ------------------------------------------------------------------ */

type BookmarksHook = ReturnType<typeof useBookmarks>;

function BookmarksTab({ hook }: { hook: BookmarksHook }) {
  const { items, loading, add, remove } = hook;
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('general');

  const handleAdd = async () => {
    if (!title.trim()) return;
    await add({ title: title.trim(), url: url.trim() || null, note: note.trim() || null, type });
    setTitle('');
    setUrl('');
    setNote('');
  };

  if (loading) return <LoadingState message="Loading bookmarks..." />;

  const typeOptions = ['general', 'system_design', 'coding', 'english', 'interview'];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Add a bookmark
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. System Design Primer" />
          <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="mt-3">
          <Textarea label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" placeholder="Why is this useful?" />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-main mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'chip capitalize',
                  type === t ? 'bg-primary text-primary-fg' : '',
                )}
              >
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <Button className="mt-3" size="sm" onClick={handleAdd} disabled={!title.trim()} leftIcon={<Plus className="h-4 w-4" />}>
          Save bookmark
        </Button>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon={<Bookmark className="h-10 w-10" />} title="No bookmarks yet" description="Save useful links, articles, and reference materials here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((b) => (
            <Card key={b.id} className="!p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="primary" className="capitalize">{b.type.replace(/_/g, ' ')}</Badge>
                <button onClick={() => void remove(b.id)} className="btn-ghost !p-1.5 shrink-0" title="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-muted" />
                </button>
              </div>
              <h4 className="font-display font-semibold text-main mb-1">{b.title}</h4>
              {b.note && <p className="text-sm text-muted mb-2">{b.note}</p>}
              {b.url && (
                <a href={b.url} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                  Open link <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Tutor tab                                                       */
/* ------------------------------------------------------------------ */

type TutorChat = ReturnType<typeof useAiChat>;

function TutorTab({ chat }: { chat: TutorChat }) {
  const { messages, loading, error, send } = chat;
  return (
    <Card className="!p-4 h-[60vh] flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-app">
        <div className="h-9 w-9 rounded-xl surface-2 border border-app flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-main">AI Tutor</h3>
          <p className="text-xs text-muted">Ask about any concept you're learning</p>
        </div>
      </div>
      <ChatPanel
        messages={messages}
        loading={loading}
        error={error}
        onSend={send}
        voiceEnabled
        placeholder="Ask your tutor anything..."
      />
    </Card>
  );
}
