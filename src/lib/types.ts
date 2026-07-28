export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SessionType =
  | 'interview'
  | 'english'
  | 'coding'
  | 'system_design';

export type InterviewCategory =
  | 'hr'
  | 'behavioral'
  | 'technical'
  | 'coding'
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'devops'
  | 'system_design'
  | 'product_manager'
  | 'data_science'
  | 'ai_ml'
  | 'company';

export type EnglishCategory =
  | 'conversation'
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation'
  | 'fluency'
  | 'listening'
  | 'speaking_challenge';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience_level: ExperienceLevel;
  goals: string[];
  preferred_companies: string[];
  target_role: string | null;
  timezone: string;
  onboarding_complete: boolean;
  onboarding_step: number;
  ai_settings: {
    model: string;
    temperature: number;
    voice: string;
    speed: number;
  };
  voice_settings: {
    recognition: string;
    auto_listen: boolean;
    silence_threshold: number;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    email_digest: boolean;
  };
  streak_count: number;
  last_active_date: string | null;
  total_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  structure: RoadmapPhase[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoadmapPhase {
  name: string;
  duration_weeks: number;
  goals: string[];
  skills: string[];
  milestones: string[];
}

export interface PracticeSession {
  id: string;
  user_id: string;
  type: SessionType;
  category: string;
  title: string | null;
  difficulty: string;
  status: SessionStatus;
  score: number | null;
  max_score: number;
  feedback: Record<string, unknown>;
  transcript: SessionMessage[];
  ai_notes: unknown[];
  duration_seconds: number;
  started_at: string;
  completed_at: string | null;
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  audio_url?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface CodeSubmission {
  id: string;
  user_id: string;
  session_id: string | null;
  problem_slug: string;
  language: string;
  code: string;
  test_results: Record<string, unknown>;
  ai_review: Record<string, unknown>;
  passed: boolean;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string | null;
  example: string | null;
  part_of_speech: string | null;
  mastery: number;
  review_count: number;
  last_reviewed_at: string | null;
}

export interface Flashcard {
  id: string;
  deck: string;
  front: string;
  back: string;
  hint: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review: string;
}

export interface Mistake {
  id: string;
  category: string;
  prompt: string | null;
  user_answer: string | null;
  correction: string | null;
  explanation: string | null;
  reviewed: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  type: string;
  title: string;
  url: string | null;
  note: string | null;
}

export interface DailyMission {
  id: string;
  mission_date: string;
  tasks: MissionTask[];
  completed_count: number;
  total_count: number;
}

export interface MissionTask {
  id: string;
  type: 'english' | 'interview' | 'coding' | 'system_design' | 'review';
  title: string;
  description: string;
  duration_minutes: number;
  completed?: boolean;
}

/* ---------------- Mastery Engine (0 -> 100 curriculum + spaced repetition) --------------- */

export type MasteryTrack = 'english' | 'coding' | 'interview';
export type CurriculumLevel = 'beginner' | 'intermediate' | 'advanced';
export type MasteryStatus = 'not_started' | 'learning' | 'review' | 'mastered';

export interface CurriculumTopic {
  id: string;
  track: MasteryTrack;
  level: CurriculumLevel;
  order_index: number;
  slug: string;
  title: string;
  description: string;
  ref_key: string | null;
  content: string | null;
}

export interface UserMastery {
  id: string;
  user_id: string;
  topic_id: string;
  score: number; // 0-100
  status: MasteryStatus;
  review_count: number;
  ease_factor: number;
  interval_days: number;
  last_reviewed_at: string | null;
  next_review_at: string;
}

/** A topic combined with the current user's progress on it (or defaults if never started). */
export interface TopicWithMastery extends CurriculumTopic {
  mastery: Pick<UserMastery, 'score' | 'status' | 'review_count' | 'next_review_at'> | null;
  /** True if the topic before it (in the same level) isn't mastered yet, or its whole level isn't unlocked yet. */
  locked: boolean;
}

/** Today's concrete plan: what's due for review, what's next to learn, per track. */
export interface DailyPlan {
  overallMastery: number; // 0-100 average across all started topics
  perTrack: Record<
    MasteryTrack,
    {
      level: CurriculumLevel;
      levelProgressPct: number; // % of current-level topics mastered
      dueReviews: TopicWithMastery[];
      nextNewTopic: TopicWithMastery | null;
    }
  >;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface SkillScore {
  id: string;
  skill: string;
  score: number;
  max_score: number;
  recorded_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
}

export interface AiMemory {
  id: string;
  key: string;
  value: string;
  importance: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiResponse<T = unknown> {
  content: string;
  data: T;
  mode: string;
}
