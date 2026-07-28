import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Users,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

type Billing = 'monthly' | 'annual';

interface Tier {
  id: string;
  name: string;
  icon: typeof Zap;
  tagline: string;
  monthly: number;
  annual: number;
  currency: '¥' | '$';
  highlighted?: boolean;
  badge?: string;
  features: string[];
  cta: string;
}

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Sparkles,
    tagline: 'Start practicing today, no card required.',
    monthly: 0,
    annual: 0,
    currency: '¥',
    cta: 'Get started free',
    features: [
      '3 practice sessions / day',
      'Basic AI feedback',
      'English speaking + 1 interview type',
      '7-day progress history',
      'Community access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    tagline: 'Everything you need to land the job.',
    monthly: 19,
    annual: 19,
    currency: '$',
    highlighted: true,
    badge: 'Most Popular',
    cta: 'Start Pro',
    features: [
      'Unlimited practice sessions',
      'Full AI feedback & code review',
      'All interview & coding categories',
      'Personal AI coach + adaptive roadmap',
      'Full analytics, skill tree & confidence graphs',
      'Daily missions & weak-area detection',
      'Priority voice processing',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    icon: Crown,
    tagline: 'For cohorts, bootcamps, and teams hiring together.',
    monthly: 49,
    annual: 49,
    currency: '$',
    cta: 'Start Team',
    features: [
      'Everything in Pro',
      'Priority support & onboarding',
      'Shared roadmaps for cohorts',
      'Advanced team analytics dashboard',
      'Admin seat management',
      'Bulk progress exports',
    ],
  },
];

interface CompareRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
}

const compareRows: CompareRow[] = [
  { label: 'Daily practice sessions', free: '3 / day', pro: 'Unlimited', team: 'Unlimited' },
  { label: 'English speaking practice', free: true, pro: true, team: true },
  { label: 'Interview types', free: '1', pro: 'All 13', team: 'All 13' },
  { label: 'Coding & system design categories', free: false, pro: true, team: true },
  { label: 'AI feedback depth', free: 'Basic', pro: 'Full', team: 'Full' },
  { label: 'AI code review', free: false, pro: true, team: true },
  { label: 'Personal AI coach', free: false, pro: true, team: true },
  { label: 'Adaptive roadmap', free: false, pro: true, team: true },
  { label: 'Daily missions', free: false, pro: true, team: true },
  { label: 'Weak-area detection', free: false, pro: true, team: true },
  { label: 'Skill tree & confidence graphs', free: '7 days', pro: 'Full history', team: 'Full history' },
  { label: 'Achievements & streaks', free: true, pro: true, team: true },
  { label: 'Priority voice processing', free: false, pro: true, team: true },
  { label: 'Shared cohort roadmaps', free: false, pro: false, team: true },
  { label: 'Advanced team analytics', free: false, pro: false, team: true },
  { label: 'Admin seat management', free: false, pro: false, team: true },
  { label: 'Priority support', free: false, pro: false, team: true },
];

const faqs: { q: string; a: string }[] = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Free plan is free forever — no credit card, no trial clock. You get 3 practice sessions per day, basic AI feedback, English speaking practice, and one interview type. It is designed to be genuinely useful, not a teaser.',
  },
  {
    q: 'What does "annual = 2 months free" mean?',
    a: 'When you choose annual billing, you pay for 10 months and get 2 months free. It works out to roughly 17% off versus paying month-to-month. The toggle above shows both prices side by side.',
  },
  {
    q: 'Can I switch plans or cancel anytime?',
    a: 'Absolutely. Upgrade, downgrade, or cancel from your account settings at any time. Changes take effect at the end of your current billing period — no penalties, no phone calls, no friction.',
  },
  {
    q: 'Do you offer student or country-adjusted pricing?',
    a: 'Yes. Students with a valid .edu email and learners in regions with lower purchasing power can request adjusted pricing. Reach out via the FAQ page contact and we will set you up.',
  },
  {
    q: 'How does the Team plan billing work?',
    a: 'The Team plan is priced per seat per month (or year). You can add or remove seats anytime, and we prorate the difference automatically. One admin manages the cohort from a shared dashboard.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards. Pro and Team plans are billed in USD; the Free plan requires no payment at all.',
  },
];

function PriceDisplay({ tier, billing }: { tier: Tier; billing: Billing }) {
  if (tier.monthly === 0) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl sm:text-4xl font-bold text-main">{tier.currency}0</span>
        <span className="text-sm text-muted">forever</span>
      </div>
    );
  }
  const effective = billing === 'annual' ? Math.round(tier.annual * 10) / 10 : tier.monthly;
  const period = billing === 'annual' ? '/mo billed annually' : '/month';
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-display text-3xl sm:text-4xl font-bold text-main">{tier.currency}{effective}</span>
      <span className="text-sm text-muted">{period}</span>
    </div>
  );
}

export function PricingPage() {
  useDocumentTitle('Pricing');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-28 lg:pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 chip mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Simple, honest pricing</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main animate-slide-up">
              Pricing that scales
              <br />
              <span className="gradient-text">with your ambition</span>
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Start free, forever. Upgrade when you are ready for unlimited practice, the full AI coach, and deep
              analytics. Cancel anytime.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className={cn('text-sm font-medium transition-colors', billing === 'monthly' ? 'text-main' : 'text-muted')}>
              Monthly
            </span>
            <button
              onClick={() => setBilling((b) => (b === 'monthly' ? 'annual' : 'monthly'))}
              className="relative h-7 w-12 rounded-full bg-surface-2 border border-app transition-colors"
              aria-label="Toggle billing period"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-all',
                  billing === 'annual' ? 'left-6' : 'left-0.5',
                )}
              />
            </button>
            <span className={cn('text-sm font-medium transition-colors', billing === 'annual' ? 'text-main' : 'text-muted')}>
              Annual
            </span>
            <Badge variant="success" className="ml-1">2 months free</Badge>
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                hover
                className={cn(
                  'relative flex flex-col h-full',
                  tier.highlighted && 'ring-2 ring-primary lg:-translate-y-3',
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" className="shadow-soft">{tier.badge}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      'h-11 w-11 rounded-xl flex items-center justify-center text-primary',
                      tier.highlighted ? 'surface-2 border border-app' : 'bg-primary/10 text-primary',
                    )}
                  >
                    <tier.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-main">{tier.name}</h3>
                </div>
                <p className="text-sm text-muted min-h-[2.5rem]">{tier.tagline}</p>

                <div className="mt-5 mb-5">
                  <PriceDisplay tier={tier} billing={billing} />
                </div>

                <Button
                  variant={tier.highlighted ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => navigate(user ? '/app/dashboard' : '/register')}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {user ? 'Go to Dashboard' : tier.cta}
                </Button>

                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                      <span className="text-main">{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            All plans include access from any device. <span className="text-main font-medium">No credit card</span> required to start.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="accent" className="mb-4">Compare every feature</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Full feature comparison</h2>
            <p className="mt-4 text-muted">See exactly what each plan unlocks.</p>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
            {/* Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 px-4 sm:px-6 py-4 border-b border-app surface-2 text-sm font-semibold text-main">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-primary">Pro</div>
              <div className="text-center">Team</div>
            </div>
            {/* Rows */}
            {compareRows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 px-4 sm:px-6 py-3.5 items-center text-sm',
                  i % 2 === 1 && 'surface-2/60',
                )}
              >
                <div className="col-span-1 text-main font-medium">{row.label}</div>
                <div className="text-center">
                  <Cell value={row.free} />
                </div>
                <div className="text-center">
                  <Cell value={row.pro} />
                </div>
                <div className="text-center">
                  <Cell value={row.team} />
                </div>
              </div>
            ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-20 lg:py-24 surface-2 border-y border-app">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="primary" className="mb-4">Pricing FAQ</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Questions about pricing</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <Card key={faq.q} className="!p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="flex items-center gap-3 font-medium text-main">
                      <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={cn('h-5 w-5 text-muted shrink-0', open && 'rotate-180')} />
                  </button>
                  <div className={cn('grid transition-all duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pl-12 text-sm text-muted leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden !p-10 lg:!p-16 text-center">
            <div className="relative">
              <Users className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-main">Start free. Upgrade when it clicks.</h2>
              <p className="mt-4 text-muted max-w-xl mx-auto">
                Most learners feel the difference within a week. Begin on Free, and move to Pro only when you are ready.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/app/dashboard' : '/register')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {user ? 'Go to Dashboard' : 'Get started free'}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/faq')}>
                  Read the FAQ
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-success-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="h-4 w-4 text-muted/40 mx-auto" />;
  }
  return <span className="text-sm text-muted">{value}</span>;
}
