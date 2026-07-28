import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Target,
  Palette,
  Mic,
  Brain,
  Bell,
  UserCog,
  Check,
  Download,
  LogOut,
  KeyRound,
  Sun,
  Moon,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, downloadJSON } from '@/lib/utils';
import type { ExperienceLevel } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const GOAL_OPTIONS = [
  'Pass technical interviews',
  'Improve English fluency',
  'Master system design',
  'Get a FAANG job',
  'Switch careers',
  'Get promoted',
  'Crack coding rounds',
  'Build confidence',
];

const COMPANY_OPTIONS = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix',
  'Stripe', 'Uber', 'Airbnb', 'Spotify', 'Tesla', 'OpenAI',
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

const VOICE_OPTIONS = ['default', 'Google US English', 'Google UK English Female', 'Google UK English Male', 'Microsoft David', 'Microsoft Zira', 'Microsoft Mark'];
const MODEL_OPTIONS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const flash = (msg: string) => {
    setSavedMsg(msg);
    window.setTimeout(() => setSavedMsg(null), 2500);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', content: <ProfileTab profile={profile} userId={user?.id} refresh={refreshProfile} flash={flash} /> },
    { id: 'goals', label: 'Goals', content: <GoalsTab profile={profile} userId={user?.id} refresh={refreshProfile} flash={flash} /> },
    { id: 'appearance', label: 'Appearance', content: <AppearanceTab flash={flash} /> },
    { id: 'voice', label: 'Voice', content: <VoiceTab profile={profile} userId={user?.id} refresh={refreshProfile} flash={flash} /> },
    { id: 'ai', label: 'AI', content: <AiTab profile={profile} userId={user?.id} refresh={refreshProfile} flash={flash} /> },
    { id: 'notifications', label: 'Notifications', content: <NotificationsTab profile={profile} userId={user?.id} refresh={refreshProfile} flash={flash} /> },
    { id: 'account', label: 'Account', content: <AccountTab email={user?.email} onSignOut={signOut} profile={profile} /> },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        description="Manage your profile, goals, appearance, voice, AI, and account preferences."
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      {savedMsg && (
        <div className="mb-4 rounded-xl border border-success-500/30 bg-success-500/10 px-4 py-3 flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4 text-success-500" />
          <span className="text-sm text-success-600 dark:text-success-400">{savedMsg}</span>
        </div>
      )}

      <Tabs tabs={tabs} defaultTab="profile" />
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Shared types                                                       */
/* ------------------------------------------------------------------ */

interface TabProps {
  profile: ReturnType<typeof useAuth>['profile'];
  userId?: string;
  refresh: () => Promise<void>;
  flash: (msg: string) => void;
}

/* ------------------------------------------------------------------ */
/* Profile tab                                                        */
/* ------------------------------------------------------------------ */

function ProfileTab({ profile, userId, refresh, flash }: TabProps) {
  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [targetRole, setTargetRole] = useState(profile?.target_role ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.display_name ?? '');
    setBio(profile?.bio ?? '');
    setTargetRole(profile?.target_role ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
  }, [profile]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ display_name: name, bio, target_role: targetRole, avatar_url: avatarUrl }).eq('id', userId);
      await refresh();
      flash('Profile updated');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <Card className="text-center">
        <Avatar name={name} src={avatarUrl} size="xl" className="mx-auto mb-3" />
        <h3 className="font-display font-semibold text-main">{name || 'Your name'}</h3>
        <p className="text-xs text-muted mt-1">{targetRole || 'No target role set'}</p>
        <Badge variant="accent" className="mt-2 capitalize">{profile?.experience_level ?? 'intermediate'}</Badge>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Profile details
        </h3>
        <div className="space-y-4">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
          <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." hint="Paste a link to your profile picture" />
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." className="min-h-[100px]" />
          <Button onClick={save} loading={saving} disabled={!userId} leftIcon={<Check className="h-4 w-4" />}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Goals tab                                                          */
/* ------------------------------------------------------------------ */

function GoalsTab({ profile, userId, refresh, flash }: TabProps) {
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? []);
  const [companies, setCompanies] = useState<string[]>(profile?.preferred_companies ?? []);
  const [experience, setExperience] = useState<ExperienceLevel>(profile?.experience_level ?? 'intermediate');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoals(profile?.goals ?? []);
    setCompanies(profile?.preferred_companies ?? []);
    setExperience(profile?.experience_level ?? 'intermediate');
  }, [profile]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ goals, preferred_companies: companies, experience_level: experience }).eq('id', userId);
      await refresh();
      flash('Goals updated');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Your goals
        </h3>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => toggle(goals, setGoals, g)}
              className={cn('chip', goals.includes(g) && 'bg-primary text-primary-fg')}
            >
              {g}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-500" />
          Target companies
        </h3>
        <div className="flex flex-wrap gap-2">
          {COMPANY_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggle(companies, setCompanies, c)}
              className={cn('chip', companies.includes(c) && 'bg-primary text-primary-fg')}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <UserCog className="h-4 w-4 text-success-500" />
          Experience level
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXPERIENCE_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setExperience(lvl)}
              className={cn(
                'rounded-xl border p-3 text-sm font-medium capitalize transition-all',
                experience === lvl ? 'border-primary bg-primary/10 text-primary' : 'border-app surface hover:surface-2 text-muted',
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </Card>

      <Button onClick={save} loading={saving} disabled={!userId} leftIcon={<Check className="h-4 w-4" />}>
        Save goals
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Appearance tab                                                     */
/* ------------------------------------------------------------------ */

function AppearanceTab({ flash }: { flash: (msg: string) => void }) {
  const { theme, setTheme } = useTheme();
  const options: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  return (
    <Card>
      <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        Theme
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => { setTheme(o.value); flash(`Theme set to ${o.label}`); }}
            className={cn(
              'rounded-xl border p-3 sm:p-4 text-center transition-all',
              theme === o.value ? 'border-primary bg-primary/10 text-primary' : 'border-app surface hover:surface-2 text-muted',
            )}
          >
            <o.icon className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Voice settings tab                                                 */
/* ------------------------------------------------------------------ */

function VoiceTab({ profile, userId, refresh, flash }: TabProps) {
  const [voice, setVoice] = useState(profile?.ai_settings?.voice ?? 'default');
  const [rate, setRate] = useState(profile?.ai_settings?.speed ?? 1);
  const [autoListen, setAutoListen] = useState(profile?.voice_settings?.auto_listen ?? false);
  const [silenceThreshold, setSilenceThreshold] = useState(profile?.voice_settings?.silence_threshold ?? 1500);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVoice(profile?.ai_settings?.voice ?? 'default');
    setRate(profile?.ai_settings?.speed ?? 1);
    setAutoListen(profile?.voice_settings?.auto_listen ?? false);
    setSilenceThreshold(profile?.voice_settings?.silence_threshold ?? 1500);
  }, [profile]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        ai_settings: { ...profile?.ai_settings, voice, speed: rate },
        voice_settings: { ...profile?.voice_settings, auto_listen: autoListen, silence_threshold: silenceThreshold },
      }).eq('id', userId);
      await refresh();
      flash('Voice settings saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
        <Mic className="h-4 w-4 text-primary" />
        Voice & speech
      </h3>
      <div className="space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-main mb-2">TTS voice</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="input-field"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-main">Speech rate</label>
            <span className="text-sm text-muted">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>0.5x</span><span>1x</span><span>2x</span>
          </div>
        </div>

        <ToggleRow label="Auto-listen" description="Automatically start listening after AI speaks" checked={autoListen} onChange={setAutoListen} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-main">Silence threshold</label>
            <span className="text-sm text-muted">{silenceThreshold}ms</span>
          </div>
          <input
            type="range"
            min={500}
            max={3000}
            step={100}
            value={silenceThreshold}
            onChange={(e) => setSilenceThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-brand-500"
          />
          <p className="text-xs text-muted mt-1">How long to wait before treating silence as the end of your speech.</p>
        </div>

        <Button onClick={save} loading={saving} disabled={!userId} leftIcon={<Check className="h-4 w-4" />}>
          Save voice settings
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* AI settings tab                                                    */
/* ------------------------------------------------------------------ */

function AiTab({ profile, userId, refresh, flash }: TabProps) {
  const [model, setModel] = useState(profile?.ai_settings?.model ?? 'gemini-2.5-flash');
  const [temperature, setTemperature] = useState(profile?.ai_settings?.temperature ?? 0.7);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setModel(profile?.ai_settings?.model ?? 'gemini-2.5-flash');
    setTemperature(profile?.ai_settings?.temperature ?? 0.7);
  }, [profile]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        ai_settings: { ...profile?.ai_settings, model, temperature },
      }).eq('id', userId);
      await refresh();
      flash('AI settings saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        AI model
      </h3>
      <div className="space-y-5 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-main mb-2">Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="input-field">
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1.5">Gemini 2.5 Flash is fast and free — great for daily practice. Flash-Lite is fastest for quick responses.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-main">Temperature</label>
            <span className="text-sm text-muted">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Precise (0)</span><span>Balanced</span><span>Creative (1)</span>
          </div>
        </div>

        <Button onClick={save} loading={saving} disabled={!userId} leftIcon={<Check className="h-4 w-4" />}>
          Save AI settings
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications tab                                                  */
/* ------------------------------------------------------------------ */

function NotificationsTab({ profile, userId, refresh, flash }: TabProps) {
  const [notifications, setNotifications] = useState(profile?.preferences?.notifications ?? true);
  const [emailDigest, setEmailDigest] = useState(profile?.preferences?.email_digest ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotifications(profile?.preferences?.notifications ?? true);
    setEmailDigest(profile?.preferences?.email_digest ?? false);
  }, [profile]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        preferences: { ...profile?.preferences, notifications, email_digest: emailDigest },
      }).eq('id', userId);
      await refresh();
      flash('Notification preferences saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        Notifications
      </h3>
      <div className="space-y-4 max-w-lg">
        <ToggleRow label="Push notifications" description="Receive in-app notifications for achievements and reminders" checked={notifications} onChange={setNotifications} />
        <ToggleRow label="Email digest" description="Get a weekly summary of your progress by email" checked={emailDigest} onChange={setEmailDigest} />
        <Button onClick={save} loading={saving} disabled={!userId} leftIcon={<Check className="h-4 w-4" />}>
          Save preferences
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Account tab                                                        */
/* ------------------------------------------------------------------ */

function AccountTab({ email, onSignOut, profile }: { email?: string; onSignOut: () => Promise<void>; profile: ReturnType<typeof useAuth>['profile'] }) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await onSignOut();
    navigate('/login');
  };

  const handleExport = () => {
    downloadJSON(profile, 'none-coach-profile.json');
  };

  const handleChangePassword = async () => {
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (!error) alert('Password reset link sent to your email.');
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Account
        </h3>
        <div className="space-y-3">
          <Row label="Email" value={email ?? '—'} />
          <Row label="Member since" value={profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
        </div>
      </Card>

      <Card>
        <h3 className="font-display font-semibold text-main mb-3">Actions</h3>
        <div className="space-y-2">
          <Button variant="secondary" className="w-full justify-start" onClick={handleExport} leftIcon={<Download className="h-4 w-4" />}>
            Export my data
          </Button>
          <Button variant="secondary" className="w-full justify-start" onClick={handleChangePassword} leftIcon={<KeyRound className="h-4 w-4" />} disabled={!email}>
            Change password
          </Button>
          <Button variant="danger" className="w-full justify-start" onClick={handleSignOut} loading={signingOut} leftIcon={<LogOut className="h-4 w-4" />}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared small components                                            */
/* ------------------------------------------------------------------ */

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl surface-2 p-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-main">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors shrink-0',
          checked ? 'bg-primary' : 'surface border border-app',
        )}
      >
        <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow', checked && 'translate-x-5')} />
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl surface-2 p-3">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-main truncate">{value}</span>
    </div>
  );
}
