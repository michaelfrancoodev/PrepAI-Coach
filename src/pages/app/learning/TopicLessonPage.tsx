import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Mic } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChatPanel } from '@/components/ChatPanel';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { useMastery } from '@/hooks/useData';
import { useAiChat } from '@/hooks/useAiChat';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { MasteryTrack } from '@/lib/types';

const TRACK_PRACTICE_PATH: Record<MasteryTrack, string> = {
  english: '/app/english',
  coding: '/app/interviews',
  interview: '/app/interviews',
};

export function TopicLessonPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { topicsWithMastery, loading } = useMastery();
  const [readyToPractice, setReadyToPractice] = useState(false);

  const topic = useMemo(() => {
    const all = [...topicsWithMastery('english'), ...topicsWithMastery('coding'), ...topicsWithMastery('interview')];
    return all.find((t) => t.slug === slug) ?? null;
  }, [topicsWithMastery, slug]);

  useDocumentTitle(topic ? `Learn — ${topic.title}` : 'Learn');

  const { messages, loading: chatLoading, error, send } = useAiChat({
    mode: 'topic_lesson',
    systemContext: {
      topic_title: topic?.title,
      topic_content: topic?.content,
      experience_level: profile?.experience_level,
      track: topic?.track,
      level: topic?.level,
    },
    temperature: 0.5,
  });

  // Kick off the lesson automatically once we know the topic.
  useEffect(() => {
    if (topic && messages.length === 0) {
      void send('Hi, I am ready to learn this topic.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading lesson..." />
      </AppLayout>
    );
  }

  if (!topic) {
    return (
      <AppLayout>
        <EmptyState title="Topic not found" description="This lesson doesn't exist or hasn't loaded yet." />
      </AppLayout>
    );
  }

  if (topic.locked) {
    return (
      <AppLayout>
        <Card className="max-w-lg mx-auto mt-10 text-center !p-8">
          <div className="h-14 w-14 rounded-xl surface-2 border border-app flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-muted" />
          </div>
          <h1 className="font-display text-xl font-bold text-main">This lesson is locked</h1>
          <p className="mt-2 text-muted">
            Master the topic before this one first — each step builds on the last, so skipping
            ahead would leave gaps. Check your progress on the Learning page.
          </p>
          <Button className="mt-6" onClick={() => navigate('/app/learning')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Learning
          </Button>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={topic.title}
        description={`${topic.track} · ${topic.level} — step ${topic.order_index}`}
        action={
          <Button variant="ghost" onClick={() => navigate('/app/learning')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Written lesson content */}
        <Card className="!p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary">Lesson</Badge>
            {topic.mastery?.status === 'mastered' && (
              <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Mastered</Badge>
            )}
          </div>
          <div className="prose-sm text-sm text-main whitespace-pre-line leading-relaxed max-h-[65vh] overflow-y-auto pr-2 code-scroll">
            {topic.content ?? topic.description}
          </div>
        </Card>

        {/* AI tutor chat — teaches what/why/where, answers questions */}
        <Card className="!p-0 flex flex-col h-[65vh]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-app">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-main">Ask your tutor anything about this</p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              loading={chatLoading}
              error={error}
              onSend={(text) => {
                send(text);
                if (/ready|understand|let'?s practice|got it|makes sense/i.test(text)) {
                  setReadyToPractice(true);
                }
              }}
              placeholder="Ask why, ask for another example, or say 'I'm ready'..."
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          onClick={() => navigate(TRACK_PRACTICE_PATH[topic.track])}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          leftIcon={topic.track === 'english' ? <Mic className="h-4 w-4" /> : undefined}
        >
          {readyToPractice ? 'Start Practice' : "I understand — start practice anyway"}
        </Button>
      </div>
    </AppLayout>
  );
}
