import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden surface-2 border-r border-app">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-50" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/">
            <Logo />
          </Link>
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 chip mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Your personal AI interview coach</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-main leading-tight">
              Practice interviews and English speaking with AI that actually listens.
            </h2>
            <p className="mt-4 text-muted">
              Live voice conversations, coding rounds, system design, and personalized roadmaps —
              all in one place. Build confidence one session at a time.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: 'Live voice interviews', value: 'AI-powered' },
                { label: 'Practice categories', value: '160+' },
                { label: 'Daily smart missions', value: 'Personalized' },
                { label: 'Progress tracking', value: 'Real-time' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl surface border border-app p-4">
                  <p className="font-display text-lg font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} PrepAI. Practice makes confident.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-6 border-b border-app">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-main mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <h1 className="font-display text-2xl font-bold text-main">{title}</h1>
            <p className="mt-1.5 text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
