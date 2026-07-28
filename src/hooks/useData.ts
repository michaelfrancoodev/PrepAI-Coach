import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type {
  PracticeSession,
  SessionMessage,
  DailyMission,
  AppNotification,
  SkillScore,
  Achievement,
  VocabularyItem,
  Flashcard,
  Mistake,
  Bookmark,
  Roadmap,
  SessionType,
  CurriculumTopic,
  UserMastery,
  TopicWithMastery,
  DailyPlan,
  MasteryTrack,
  MasteryStatus,
  CurriculumLevel,
} from '@/lib/types';

export function useSessions(limit = 50) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);
    if (!error && data) setSessions(data as PracticeSession[]);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { sessions, loading, reload: load };
}

export function useCreateSession() {
  const { user } = useAuth();
  return useCallback(
    async (input: {
      type: SessionType;
      category: string;
      title?: string;
      difficulty?: string;
    }): Promise<PracticeSession | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          type: input.type,
          category: input.category,
          title: input.title ?? null,
          difficulty: input.difficulty ?? 'medium',
          status: 'in_progress',
        })
        .select()
        .maybeSingle();
      if (error) {
        console.error('Create session error:', error.message);
        return null;
      }
      return data as PracticeSession;
    },
    [user],
  );
}

export function useUpdateSession() {
  return useCallback(
    async (id: string, patch: Partial<PracticeSession> & { transcript?: SessionMessage[] }) => {
      const { error } = await supabase.from('practice_sessions').update(patch).eq('id', id);
      if (error) console.error('Update session error:', error.message);
      return !error;
    },
    [],
  );
}

export function useAddMessage() {
  const { user } = useAuth();
  return useCallback(
    async (sessionId: string, msg: SessionMessage) => {
      if (!user) return false;
      const { error } = await supabase.from('session_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        audio_url: msg.audio_url ?? null,
        metadata: msg.metadata ?? {},
      });
      if (error) console.error('Add message error:', error.message);
      return !error;
    },
    [user],
  );
}

export function useDailyMission() {
  const { user } = useAuth();
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', user.id)
      .eq('mission_date', today)
      .maybeSingle();
    setMission(data as DailyMission | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMission = useCallback(
    async (tasks: DailyMission['tasks']) => {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('daily_missions')
        .upsert(
          {
            user_id: user.id,
            mission_date: today,
            tasks: tasks as unknown as never,
            total_count: tasks.length,
            completed_count: tasks.filter((t) => t.completed).length,
          },
          { onConflict: 'user_id,mission_date' },
        )
        .select()
        .maybeSingle();
      if (!error && data) setMission(data as DailyMission);
    },
    [user],
  );

  return { mission, loading, saveMission, reload: load };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications((data as AppNotification[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(
    async (id: string) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      load();
    },
    [load],
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    load();
  }, [user, load]);

  return { notifications, loading, markRead, markAllRead, reload: load };
}

export function useSkillScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState<SkillScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('skill_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });
      setScores((data as SkillScore[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return { scores, loading };
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      setAchievements((data as Achievement[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  return { achievements, loading };
}

export function useVocabulary() {
  const { user } = useAuth();
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vocabulary_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as VocabularyItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (word: string, definition: string, example?: string, partOfSpeech?: string) => {
      if (!user) return;
      await supabase.from('vocabulary_items').insert({
        user_id: user.id,
        word,
        definition,
        example,
        part_of_speech: partOfSpeech,
      });
      load();
    },
    [user, load],
  );

  const updateMastery = useCallback(
    async (id: string, mastery: number) => {
      await supabase
        .from('vocabulary_items')
        .update({ mastery, review_count: 1, last_reviewed_at: new Date().toISOString() })
        .eq('id', id);
      load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      await supabase.from('vocabulary_items').delete().eq('id', id);
      load();
    },
    [load],
  );

  return { items, loading, add, updateMastery, remove, reload: load };
}

export function useFlashcards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true });
    setCards((data as Flashcard[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (front: string, back: string, deck = 'general', hint?: string) => {
      if (!user) return;
      await supabase.from('flashcards').insert({
        user_id: user.id,
        front,
        back,
        deck,
        hint,
      });
      load();
    },
    [user, load],
  );

  const review = useCallback(
    async (id: string, quality: number) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      let { ease_factor, interval_days, repetitions } = card;
      if (quality < 3) {
        repetitions = 0;
        interval_days = 1;
      } else {
        repetitions += 1;
        interval_days =
          repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.round(interval_days * ease_factor);
      }
      ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      const next = new Date();
      next.setDate(next.getDate() + interval_days);
      await supabase
        .from('flashcards')
        .update({ ease_factor, interval_days, repetitions, next_review: next.toISOString().slice(0, 10) })
        .eq('id', id);
      load();
    },
    [cards, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await supabase.from('flashcards').delete().eq('id', id);
      load();
    },
    [load],
  );

  return { cards, loading, add, review, remove, reload: load };
}

export function useMistakes() {
  const { user } = useAuth();
  const [items, setItems] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mistakes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as Mistake[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (m: Omit<Mistake, 'id' | 'reviewed' | 'created_at'>) => {
      if (!user) return;
      await supabase.from('mistakes').insert({ user_id: user.id, ...m });
      load();
    },
    [user, load],
  );

  const markReviewed = useCallback(
    async (id: string) => {
      await supabase.from('mistakes').update({ reviewed: true }).eq('id', id);
      load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      await supabase.from('mistakes').delete().eq('id', id);
      load();
    },
    [load],
  );

  return { items, loading, add, markReviewed, remove, reload: load };
}

export function useBookmarks() {
  const { user } = useAuth();
  const [items, setItems] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as Bookmark[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (b: Omit<Bookmark, 'id'>) => {
      if (!user) return;
      await supabase.from('bookmarks').insert({ user_id: user.id, ...b });
      load();
    },
    [user, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await supabase.from('bookmarks').delete().eq('id', id);
      load();
    },
    [load],
  );

  return { items, loading, add, remove, reload: load };
}

export function useRoadmaps() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRoadmaps((data as Roadmap[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (title: string, description: string, structure: Roadmap['structure']) => {
      if (!user) return null;
      await supabase.from('roadmaps').update({ is_active: false }).eq('user_id', user.id);
      const { data, error } = await supabase
        .from('roadmaps')
        .insert({
          user_id: user.id,
          title,
          description,
          structure: structure as unknown as never,
          is_active: true,
        })
        .select()
        .maybeSingle();
      if (error) {
        console.error('Save roadmap error:', error.message);
        return null;
      }
      load();
      return data as Roadmap;
    },
    [user, load],
  );

  return { roadmaps, loading, save, reload: load };
}

/* ------------------------------------------------------------------ */
/* Mastery Engine                                                      */
/* ------------------------------------------------------------------ */
//
// Curriculum content (curriculum_topics) is shared, hand-authored, and
// seeded once via migration. Progress (user_mastery) is per-user.
//
// Spaced repetition uses a lightweight SM-2 variant: after a practice
// session, the caller reports a 0-100 performance score. That's mapped to
// a 0-5 "quality" grade. Good grades push the next review further out
// (interval grows by ease_factor); poor grades reset the interval to 1 day
// and shrink the ease_factor, so weak topics come back sooner.
//
// Level progression is gated: a track's "advanced" topics don't show up as
// the next thing to learn until every "beginner" topic in that track is
// mastered (score >= 70), and so on for intermediate -> advanced. This is
// what makes the journey feel like 0 -> 100 rather than a random grab bag.

const MASTERY_THRESHOLD = 70;
const LEVEL_ORDER: CurriculumLevel[] = ['beginner', 'intermediate', 'advanced'];
const TRACKS: MasteryTrack[] = ['english', 'coding', 'interview'];

function gradeFromPerformance(performance: number): number {
  // 0-100 -> 0-5, clamped
  return Math.max(0, Math.min(5, Math.round(performance / 20)));
}

/** SM-2-lite: returns the updated scheduling fields after one review. */
function scheduleNextReview(current: Pick<UserMastery, 'review_count' | 'ease_factor' | 'interval_days'>, performance: number) {
  const quality = gradeFromPerformance(performance);
  const { review_count } = current;
  let { ease_factor, interval_days } = current;

  if (quality < 3) {
    // Poor performance: start the spacing over, and make the topic "stickier"
    // (lower ease) so it comes back more often until it's solid.
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else {
    if (review_count === 0) interval_days = 1;
    else if (review_count === 1) interval_days = 3;
    else interval_days = Math.round(interval_days * ease_factor);
    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  const next_review_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000).toISOString();
  return { review_count: review_count + 1, ease_factor, interval_days, next_review_at, quality };
}

export function useMastery() {
  const { user, profile } = useAuth();
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [mastery, setMastery] = useState<UserMastery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [topicsRes, masteryRes] = await Promise.all([
      supabase.from('curriculum_topics').select('*').order('track').order('level').order('order_index'),
      supabase.from('user_mastery').select('*').eq('user_id', user.id),
    ]);
    if (topicsRes.data) setTopics(topicsRes.data as CurriculumTopic[]);
    if (masteryRes.data) setMastery(masteryRes.data as UserMastery[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const topicsWithMastery = useCallback(
    (track?: MasteryTrack): TopicWithMastery[] => {
      const byId = new Map(mastery.map((m) => [m.topic_id, m]));
      const trackList = track ? [track] : TRACKS;
      const result: TopicWithMastery[] = [];

      for (const t of trackList) {
        // Full learning order for this track: beginner topics (in order),
        // then intermediate, then advanced. A topic is locked until the one
        // directly before it in THIS sequence is mastered — true one-at-a-
        // time progression, not just "any beginner topic is fair game".
        const ordered = topics
          .filter((x) => x.track === t)
          .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || a.order_index - b.order_index);

        ordered.forEach((topic, i) => {
          const m = byId.get(topic.id);
          const prev = i > 0 ? ordered[i - 1] : null;
          const prevScore = prev ? (byId.get(prev.id)?.score ?? 0) : null;
          const locked = prev !== null && (prevScore ?? 0) < MASTERY_THRESHOLD;
          result.push({
            ...topic,
            mastery: m ? { ...m } : null,
            locked,
          });
        });
      }

      return track ? result : result;
    },
    [topics, mastery],
  );

  /** Records the result of a practice/quiz session and reschedules the topic. */
  const recordPractice = useCallback(
    async (topicId: string, performance: number) => {
      if (!user) return;
      const existing = mastery.find((m) => m.topic_id === topicId);
      const base = existing ?? { review_count: 0, ease_factor: 2.5, interval_days: 1, score: 0 };
      const { review_count, ease_factor, interval_days, next_review_at } = scheduleNextReview(base, performance);
      const smoothedScore = Math.round(base.score * 0.6 + performance * 0.4);
      const status: MasteryStatus = smoothedScore >= MASTERY_THRESHOLD && review_count >= 2 ? 'mastered' : smoothedScore > 0 ? 'review' : 'learning';

      const { data, error } = await supabase
        .from('user_mastery')
        .upsert(
          {
            user_id: user.id,
            topic_id: topicId,
            score: smoothedScore,
            status,
            review_count,
            ease_factor,
            interval_days,
            last_reviewed_at: new Date().toISOString(),
            next_review_at,
          },
          { onConflict: 'user_id,topic_id' },
        )
        .select()
        .maybeSingle();

      if (!error && data) {
        setMastery((prev) => {
          const next = prev.filter((m) => m.topic_id !== topicId);
          return [...next, data as UserMastery];
        });
      }
      return !error;
    },
    [user, mastery],
  );

  /** Builds today's concrete plan: due reviews + the single next new topic, per track. */
  const dailyPlan = useCallback((): DailyPlan => {
    const now = new Date();
    const userLevel: CurriculumLevel =
      profile?.experience_level === 'expert' ? 'advanced' : (profile?.experience_level as CurriculumLevel) ?? 'beginner';

    const perTrack = {} as DailyPlan['perTrack'];
    const allScores: number[] = [];

    for (const track of TRACKS) {
      const all = topicsWithMastery(track);
      allScores.push(...all.filter((t) => t.mastery).map((t) => t.mastery!.score));

      // Work out the highest level unlocked so far: start at the user's
      // declared level, but don't let them skip an earlier level they
      // haven't actually mastered yet.
      let unlockedLevel: CurriculumLevel = 'beginner';
      for (const level of LEVEL_ORDER) {
        const levelTopics = all.filter((t) => t.level === level);
        const levelDone = levelTopics.length > 0 && levelTopics.every((t) => (t.mastery?.score ?? 0) >= MASTERY_THRESHOLD);
        if (level === userLevel || (LEVEL_ORDER.indexOf(level) <= LEVEL_ORDER.indexOf(userLevel))) {
          unlockedLevel = level;
        }
        if (!levelDone) break;
        unlockedLevel = LEVEL_ORDER[Math.min(LEVEL_ORDER.indexOf(level) + 1, LEVEL_ORDER.length - 1)];
      }

      const levelTopics = all.filter((t) => t.level === unlockedLevel).sort((a, b) => a.order_index - b.order_index);
      const masteredInLevel = levelTopics.filter((t) => (t.mastery?.score ?? 0) >= MASTERY_THRESHOLD).length;
      const levelProgressPct = levelTopics.length > 0 ? Math.round((masteredInLevel / levelTopics.length) * 100) : 0;

      const dueReviews = all.filter((t) => t.mastery && t.mastery.status !== 'not_started' && new Date(t.mastery.next_review_at) <= now);
      const nextNewTopic = levelTopics.find((t) => !t.mastery || t.mastery.status === 'not_started') ?? null;

      perTrack[track] = { level: unlockedLevel, levelProgressPct, dueReviews, nextNewTopic };
    }

    const overallMastery = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    return { overallMastery, perTrack };
  }, [topicsWithMastery, profile]);

  return { topics, mastery, loading, reload: load, topicsWithMastery, recordPractice, dailyPlan };
}

/* ------------------------------------------------------------------ */
/* Word of the Day                                                     */
/* ------------------------------------------------------------------ */
//
// Picks one word per calendar day from the shared word_of_day_pool table,
// deterministically (same word for everyone all day, a different one the
// next day) — no AI call involved, so it costs nothing against the free
// Gemini quota and never repeats unpredictably within a day.

interface WordOfDay {
  word: string;
  meaning: string;
  example: string;
  category: 'interview' | 'tech' | 'general';
}

export function useWordOfTheDay() {
  const [word, setWord] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('word_of_day_pool').select('word, meaning, example, category').order('word');
      if (cancelled) return;
      if (data && data.length > 0) {
        // Day-of-year mod pool size -> same index all day, rotates daily.
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const pick = data[dayOfYear % data.length] as WordOfDay;
        setWord(pick);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { word, loading };
}
