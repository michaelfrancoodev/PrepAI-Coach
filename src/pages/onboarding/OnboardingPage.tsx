import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Brain,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const TOTAL_STEPS = 4;
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to tech or English interviews' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some practice, ready to level up' },
  { id: 'advanced', label: 'Advanced', desc: 'Experienced, targeting senior roles' },
  { id: 'expert', label: 'Expert', desc: 'Staff/principal level, polishing edge cases' },
];
const GOALS = [
  'Improve English fluency', 'Pass coding interviews', 'Master system design',
  'Ace behavioral interviews', 'Build interview confidence', 'Switch careers to tech',
  'Get a job at a top company', 'Prepare for promotion',
];
export function OnboardingPage() {
  useDocumentTitle('Set up your profile');
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState('beginner');
  const [goals, setGoals] = useState<string[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [englishLevel, setEnglishLevel] = useState('intermediate');
  const [codingLevel, setCodingLevel] = useState('intermediate');
  const [error, setError] = useState<string | null>(null);

  const stepNames = ['Welcome', 'English', 'Coding', 'Experience', 'Goals', 'Companies', 'Roadmap', 'Done'];

  const toggle = (list: string[], setter: (v: string[]) => void, value: string, max?: number) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      if (max && list.length >= max) return;
      setter([...list, value]);
    }
  };

  const updateProfile = async (patch: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('profiles').update(patch).eq('id', user.id);
  };

  const next = () => {
    setError(null);
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    try {
      await updateProfile({
        experience_level: experience,
        english_level: englishLevel,
        coding_level: codingLevel,
        goals,
        target_role: targetRole || null,
        onboarding_complete: true,
        onboarding_step: TOTAL_STEPS,
      });
      await refreshProfile();
      navigate('/app/dashboard');
    } catch {
      setError('Could not save your profile. Check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <header className="border-b border-app surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/dashboard')}>
              Skip for now
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-4">
          <Progress value={step + 1} max={TOTAL_STEPS} />
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {stepNames.map((name, i) => (
              <span key={name} className={cn('text-xs whitespace-nowrap shrink-0', i <= step ? 'text-primary font-medium' : 'text-muted')}>
                {i + 1}. {name}{i < step ? ' ✓' : ''}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-6 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="animate-slide-up text-center py-4 sm:py-8">
              <div className="h-16 w-16 rounded-2xl surface-2 border border-app flex items-center justify-center mx-auto mb-6">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-main break-words">Welcome to PrepAI{profile?.display_name ? `, ${profile.display_name}` : ''}!</h1>
              <p className="mt-4 text-muted max-w-md mx-auto">
                Just a couple of quick questions — where you're starting from and what you're
                working toward — then you're straight into your personalized curriculum.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-left">
                {[
                  { icon: Target, label: 'Your level' },
                  { icon: Brain, label: 'Your goals' },
                  { icon: Rocket, label: 'Start learning' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-xl surface border border-app p-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-main">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: English Assessment */}
          {/* Step 1: Combined self-assessment — one question instead of three overlapping ones.
              The Mastery Engine tracks English/Coding/Interview progress independently anyway,
              based on actual practice results, so a single starting point here is enough; it's
              a starting point, not a permanent label. */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <div className="h-14 w-14 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-main">Where are you starting from?</h1>
                <p className="mt-2 text-muted">
                  A rough starting point — practice results will fine-tune this per skill as you go.
                </p>
              </div>
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    selected={experience === opt.id}
                    onClick={() => {
                      setExperience(opt.id);
                      setEnglishLevel(opt.id);
                      setCodingLevel(opt.id);
                    }}
                    label={opt.label}
                    desc={opt.desc}
                  />
                ))}
              </div>
              <div className="mt-6">
                <Input
                  label="Target role (optional)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  hint="Helps your AI coach tailor practice to the right level"
                />
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <div className="h-14 w-14 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-main">What are your goals?</h1>
                <p className="mt-2 text-muted">Select all that apply. Your AI coach will prioritize these.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggle(goals, setGoals, goal)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-4 text-left transition-all min-h-[48px]',
                      goals.includes(goal) ? 'border-primary bg-primary/5' : 'border-app surface hover:surface-2',
                    )}
                  >
                    <div className={cn('h-5 w-5 rounded-md border flex items-center justify-center shrink-0', goals.includes(goal) ? 'border-primary bg-primary text-primary-fg' : 'border-app')}>
                      {goals.includes(goal) && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-sm font-medium text-main">{goal}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="animate-slide-up text-center py-6 sm:py-12">
              <div className="h-20 w-20 rounded-2xl surface-2 border border-app flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-main">You're all set!</h1>
              <p className="mt-4 text-muted max-w-md mx-auto">
                Your AI coach is ready and matched to your level. When you land on your dashboard,
                you'll see exactly one recommended action to start with — no need to figure out
                where to begin.
              </p>
            </div>
          )}

          {/* Navigation */}
          {error && (
            <div className="mt-6 rounded-xl border border-error-500/30 bg-error-500/5 px-4 py-3 text-sm text-error-600 dark:text-error-400 text-center">
              {error}
            </div>
          )}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={prev} disabled={step === 0} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button onClick={next} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            ) : (
              <Button onClick={finish} rightIcon={<ArrowRight className="h-4 w-4" />} size="lg">
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function OptionCard({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all w-full min-h-[56px]',
        selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-app surface hover:surface-2',
      )}
    >
      <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0', selected ? 'border-primary' : 'border-app')}>
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-main break-words">{label}</p>
        <p className="text-sm text-muted break-words">{desc}</p>
      </div>
    </button>
  );
}
