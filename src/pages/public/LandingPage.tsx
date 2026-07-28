import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Users,
  Code2,
  Network,
  Bot,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
  Brain,
  Target,
  Zap,
  MessageSquare,
  Award,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function LandingPage() {
  useDocumentTitle('PrepAI — AI Interview & English Speaking Coach');
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { value: '160+', label: 'Practice paths' },
    { value: 'AI', label: 'Voice interviews' },
    { value: 'Daily', label: 'Smart missions' },
    { value: 'Real', label: 'Company mock rounds' },
  ];

  const features = [
    { icon: Mic, title: 'English Speaking', desc: 'Live voice conversations, grammar, pronunciation, and fluency practice with instant AI feedback.', color: 'surface-2 border border-app' },
    { icon: Users, title: 'Interview Practice', desc: 'HR, behavioral, technical, and company-specific mock interviews that adapt to your answers.', color: 'surface-2 border border-app' },
    { icon: Code2, title: 'Coding Rounds', desc: 'Solve problems in a real editor with test cases, hints, and AI code review on every submission.', color: 'surface-2 border border-app' },
    { icon: Network, title: 'System Design', desc: 'Whiteboard system design sessions with AI probing questions and trade-off discussions.', color: 'surface-2 border border-app' },
    { icon: Bot, title: 'AI Coach', desc: 'A personal coach that remembers your weak areas, builds your roadmap, and motivates you daily.', color: 'surface-2 border border-app' },
    { icon: TrendingUp, title: 'Progress Analytics', desc: 'Skill trees, confidence graphs, and AI insights that show exactly where you are improving.', color: 'surface-2 border border-app' },
  ];

  const steps = [
    { icon: Target, title: 'Assess your level', desc: 'A quick AI assessment maps your current English, coding, and interview readiness.' },
    { icon: Brain, title: 'Get your roadmap', desc: 'AI builds a personalized, week-by-week plan tuned to your goals and target companies.' },
    { icon: MessageSquare, title: 'Practice daily', desc: 'Speak, code, and answer questions in realistic live sessions with voice and text.' },
    { icon: Award, title: 'Track and improve', desc: 'Every session is scored. Watch your confidence and skills climb with real analytics.' },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>AI-powered interview & English coaching</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Land your dream job with
              <br />
              <span className="gradient-text">confident, AI-coached practice</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              PrepAI is your personal AI mentor for English speaking, coding interviews, technical rounds,
              and behavioral interviews. Practice with live voice, get instant feedback, and follow a roadmap
              that adapts as you grow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                {user ? 'Go to Dashboard' : 'Start practicing free'}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/how-it-works')}>
                See how it works
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> Practice instantly</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-500" /> Your own AI coach</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {stats.map((s) => (
              <Card key={s.label} className="text-center !p-5">
                <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="primary" className="mb-4">Everything you need</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">One coach for the whole interview journey</h2>
            <p className="mt-4 text-muted">From your first English sentence to your final system design round — all in one place, all guided by AI.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} hover className="group">
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center text-primary mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-main">{f.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works preview */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="accent" className="mb-4">How it works</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Four steps to interview-ready</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <Card className="h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-2xl font-bold text-app-border" style={{ color: 'rgb(var(--color-border))' }}>0{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-main">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
                </Card>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate('/how-it-works')} rightIcon={<ArrowRight className="h-5 w-5" />}>
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-16 text-center">
            <div className="relative">
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Ready to crush your next interview?</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">Join PrepAI today and turn practice into confidence. Your AI coach is waiting.</p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {user ? 'Open Dashboard' : 'Get started free'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/pricing')}>
                  View pricing
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
