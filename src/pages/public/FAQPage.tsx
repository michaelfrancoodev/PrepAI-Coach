import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Mic,
  Users,
  Code2,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {} from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

interface QA {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: QA[];
}

const categories: FaqCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: HelpCircle,
    items: [
      {
        q: 'What exactly is PrepAI?',
        a: 'PrepAI is an AI-powered interview and English speaking coach. It combines live voice interview simulation, coding practice, system design sessions, English fluency drills, a personalized adaptive roadmap, and progress analytics into a single platform. Think of it as a personal mentor available 24/7 that remembers your weak areas and guides you toward job-ready.',
      },
      {
        q: 'Who is PrepAI built for?',
        a: 'It is built for anyone preparing for interviews where English and technical skills matter — university students, career switchers, non-native English speakers, senior engineers brushing up, and bootcamp graduates. If you need to speak confidently and solve problems under pressure, PrepAI is designed for you.',
      },
      {
        q: 'Do I need any prior experience?',
        a: 'No. The assessment places you at the right starting point, whether you are a beginner forming your first English sentences or a senior engineer sharpening system design. The roadmap adapts to your level, so you never feel lost or bored.',
      },
      {
        q: 'Is PrepAI a replacement for a human tutor?',
        a: 'It complements rather than replaces human practice. PrepAI is available any time, costs a fraction of tutoring, and gives instant detailed feedback. Many users pair it with occasional peer or tutor mock interviews for the final polish — and arrive at those sessions dramatically better prepared.',
      },
      {
        q: 'How is this different from other interview prep sites?',
        a: 'Most sites offer static question banks. PrepAI offers live, adaptive AI dialogue that responds to your specific answers, remembers your history, builds a personalized roadmap, and tracks real skill growth over time. It is a coach, not a content library.',
      },
      {
        q: 'What devices can I use it on?',
        a: 'PrepAI works in any modern browser on desktop, tablet, and mobile. Voice practice requires a microphone, which is standard on virtually all devices. There is nothing to install.',
      },
    ],
  },
  {
    id: 'english',
    label: 'English Speaking',
    icon: Mic,
    items: [
      {
        q: 'How does the AI assess my pronunciation?',
        a: 'When you speak, your audio is analyzed at the phoneme level — meaning each individual sound is scored against a native reference. The coach flags specific phonemes you struggle with and gives targeted drill exercises, so improvement is precise rather than vague.',
      },
      {
        q: 'I am a non-native speaker. Will it adapt to my accent?',
        a: 'Yes. The pronunciation model is accent-aware and scores intelligibility and consistency rather than forcing a single native accent. The goal is clear, confident communication — not erasing your identity.',
      },
      {
        q: 'Can I practice specific situations like interviews or meetings?',
        a: 'Absolutely. There is a dedicated Interview English track plus conversation scenarios for meetings, small talk, defending a technical opinion, and more. Each scenario uses vocabulary and structures relevant to that context.',
      },
      {
        q: 'How does vocabulary building actually work?',
        a: 'The coach tracks words you overuse (like "good" or "thing") and suggests richer alternatives at your level. New words enter a spaced-repetition queue so you review them at optimal intervals — which is how vocabulary actually moves into long-term memory.',
      },
      {
        q: 'Will it help with fluency and reducing filler words?',
        a: 'Yes. Fluency metrics track your words per minute, pause frequency, filler-word count (um, uh, like), and restart rate. Over sessions you can watch these numbers improve, and the coach gives specific drills to target weak fluency patterns.',
      },
    ],
  },
  {
    id: 'interview',
    label: 'Interview Practice',
    icon: Users,
    items: [
      {
        q: 'What types of interviews can I practice?',
        a: 'Thirteen formats: HR & recruiter, behavioral, technical Q&A, coding, frontend, backend, full-stack, DevOps, system design, product manager, data science, AI/ML, and company-specific mocks. Each has its own question style, difficulty, and grading rubric.',
      },
      {
        q: 'Are the voice interviews really spoken, or just text chat?',
        a: 'They are genuinely spoken. You talk into your microphone and the AI interviewer responds with voice, probing your answers with follow-up questions — just like a real interviewer. This builds the muscle of thinking and speaking under pressure, which text-only practice cannot.',
      },
      {
        q: 'How does behavioral interview feedback work?',
        a: 'The coach evaluates your answers against the STAR method (Situation, Task, Action, Result) and checks whether your story actually demonstrates the competency being assessed. It flags vague answers, missing results, and opportunities to make the story more impactful.',
      },
      {
        q: 'What are company-specific mocks?',
        a: 'These are mock interviews calibrated to the question style and difficulty of target companies — FAANG, unicorns, and remote-first startups each have distinct flavors. You get a feel for what a specific company asks before you sit in the real room.',
      },
      {
        q: 'Can I retry an interview if I bomb it?',
        a: 'Always. On the Pro plan sessions are unlimited, so you can retry as many times as you want. Each attempt is scored independently and logged in your history so you can compare performances and watch yourself improve.',
      },
      {
        q: 'Does the AI interviewer get harder as I improve?',
        a: 'Yes. The interviewer calibrates follow-up depth and question difficulty to your performance in real time. Strong answers trigger harder probing; shaky answers get scaffolding. You are always challenged but never overwhelmed.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: Code2,
    items: [
      {
        q: 'What languages can I code in?',
        a: 'The coding editor supports the most common interview languages including JavaScript, TypeScript, Python, Java, and C++. Test cases run against your solution immediately, just like a real coding round.',
      },
      {
        q: 'How does AI code review work?',
        a: 'After you submit, the AI reviews correctness, time and space complexity, code style, and edge-case handling. It discusses alternative approaches and points out where your solution could be simpler or more robust — the kind of feedback a strong interviewer gives.',
      },
      {
        q: 'Are there hints if I get stuck?',
        a: 'Yes. You can request a hint at any time without penalty on practice mode. Hints are graduated — the first nudges your thinking, the next is more concrete — so you can choose how much help you want, mimicking real interview conditions.',
      },
      {
        q: 'What system design problems are available?',
        a: 'Classic and modern design problems including URL shortener, chat system, rate limiter, key-value store, e-commerce checkout, notification system, and news feed. Each session probes your assumptions, trade-offs, and failure modes like a staff engineer would.',
      },
      {
        q: 'Is system design practice voice-based too?',
        a: 'It can be. You can whiteboard in text while thinking aloud, or run a full voice session where you explain your design and the AI probes it live. Voice mode best simulates a real whiteboard interview.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Billing',
    icon: UserCircle,
    items: [
      {
        q: 'Is the free plan really free forever?',
        a: 'Yes. The Free plan never expires and requires no credit card. You get 3 practice sessions per day, basic AI feedback, English speaking practice, and one interview type. It is designed to be genuinely useful on its own.',
      },
      {
        q: 'How do I upgrade to Pro or Team?',
        a: 'Go to your account settings and choose a plan. Upgrades take effect immediately and we prorate any remaining time on your current plan. The whole process takes under a minute.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel from your account settings at any time with one click. Your plan stays active until the end of the current billing period, then reverts to Free. No phone calls, no friction, no retention gauntlets.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'If you cancel within 7 days of your first Pro or Team payment and have not completed more than 10 sessions, contact us for a full refund. After that, you can cancel to stop future billing at any time.',
      },
      {
        q: 'Is my practice data private?',
        a: 'Your session audio, transcripts, and scores are private to your account and used only to power your personal coaching. We do not sell data or use your content to train shared models. You can export or delete your data at any time.',
      },
      {
        q: 'Do you offer student or regional pricing?',
        a: 'Yes. Students with a valid .edu email and learners in regions with lower purchasing power can request adjusted pricing. Reach out through the contact section below and we will get you set up.',
      },
    ],
  },
];

export function FAQPage() {
  useDocumentTitle('FAQ');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(categories[0].id);
  const [openKey, setOpenKey] = useState<string | null>(`${categories[0].id}-0`);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-28 lg:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Answers to common questions</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Frequently asked
              <br />
              <span className="gradient-text">questions</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Everything you might want to know about PrepAI — how it works, who it is for, and what is included.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ body */}
      <section className="pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[260px_1fr] gap-8">
            {/* Sidebar / tabs */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {categories.map((cat) => {
                  const isActive = cat.id === activeId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveId(cat.id);
                        setOpenKey(`${cat.id}-0`);
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all whitespace-nowrap lg:w-full text-left',
                        isActive
                          ? 'bg-primary/10 text-primary surface border border-primary/20'
                          : 'text-muted hover:surface-2 hover:text-main border border-transparent',
                      )}
                    >
                      <cat.icon className="h-5 w-5 shrink-0" />
                      <span>{cat.label}</span>
                      <span className={cn('ml-auto hidden lg:inline text-xs', isActive ? 'text-primary' : 'text-muted')}>
                        {cat.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Accordion */}
            <div className="space-y-3">
              <div className="mb-2 flex items-center gap-2">
                <active.icon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-main">{active.label}</h2>
              </div>
              {active.items.map((item, i) => {
                const key = `${active.id}-${i}`;
                const open = openKey === key;
                return (
                  <Card key={item.q} className="!p-0 overflow-hidden animate-fade-in">
                    <button
                      onClick={() => setOpenKey(open ? null : key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-medium text-main">{item.q}</span>
                      <ChevronDown className={cn('h-5 w-5 text-muted shrink-0', open && 'rotate-180')} />
                    </button>
                    <div className={cn('grid transition-all duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-muted leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-14 text-center">
            <div className="relative">
              <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Still have questions?</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                We are happy to help. Start a free account and explore, or reach out and we will answer anything we
                missed here.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {user ? 'Go to Dashboard' : 'Get started free'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>
                  View pricing
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Average response time: under 24 hours</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}


