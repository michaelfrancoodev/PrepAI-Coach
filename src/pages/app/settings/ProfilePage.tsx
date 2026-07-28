import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Flame,
  Clock,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Network,
  Mic,
  Code2,
  Users,
  Briefcase,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useAuth } from '@/context/AuthContext';
import { useSessions, useSkillScores, useAchievements } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo, formatTime } from '@/lib/utils';

function scoreProgressColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'error';
}
function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-success-500';
  if (score >= 60) return 'text-warning-500';
  return 'text-error-500';
}
function typeIcon(type: string) {
  if (type === 'english') return Mic;
  if (type === 'coding') return Code2;
  if (type === 'interview') return Users;
  return Network;
}

export function ProfilePage() {
  useDocumentTitle('Profile');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { sessions, loading } = useSessions(20);
  const { scores } = useSkillScores();
  const { achievements } = useAchievements();

  const completed = sessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.score ?? 0), 0) / completed.length)
    : 0;
  const streak = profile?.streak_count ?? 0;

  /* Latest score per skill */
  const latestBySkill = new Map<string, number>();
  for (const s of scores) {
    latestBySkill.set(s.skill, s.score);
  }
  const skillList = [...latestBySkill.entries()].map(([skill, score]) => ({ skill, score }));

  const stats = [
    { icon: Target, label: 'Total sessions', value: String(sessions.length), color: 'text-primary' },
    { icon: Clock, label: 'Total minutes', value: String(totalMinutes), color: 'text-accent-500' },
    { icon: Flame, label: 'Day streak', value: String(streak), color: 'text-warning-500' },
    { icon: Award, label: 'Achievements', value: String(achievements.length), color: 'text-success-500' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="My Profile"
        description="Your public-style profile card showing your progress, skills, and recent activity."
        icon={<Briefcase className="h-5 w-5" />}
        action={
          <Button onClick={() => navigate('/app/settings')} leftIcon={<Pencil className="h-4 w-4" />}>
            Edit profile
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: profile header + skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header card */}
          <Card className="relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
              <Avatar name={profile?.display_name} src={profile?.avatar_url} size="xl" />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-main">{profile?.display_name ?? 'Learner'}</h2>
                {profile?.target_role && (
                  <p className="text-sm text-primary font-medium mt-0.5">{profile.target_role}</p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                  <Badge variant="accent" className="capitalize">{profile?.experience_level ?? 'intermediate'}</Badge>
                  <Badge variant="primary" dot>Streak {streak}</Badge>
                  <Badge variant="success">Avg {avgScore}/100</Badge>
                </div>
                {profile?.bio && <p className="text-sm text-muted mt-3 max-w-xl">{profile.bio}</p>}
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="!p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted uppercase tracking-wide">{s.label}</span>
                  <s.icon className={cn('h-4 w-4', s.color)} />
                </div>
                <p className="font-display text-xl font-bold text-main">{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Skills overview */}
          <Card>
            <h3 className="font-display font-semibold text-main mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Skills overview
            </h3>
            {skillList.length === 0 ? (
              <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No skill data yet" description="Complete scored sessions to see your skill breakdown." />
            ) : (
              <div className="space-y-4">
                {skillList
                  .sort((a, b) => b.score - a.score)
                  .map((s) => (
                    <div key={s.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-main capitalize">{s.skill.replace(/_/g, ' ')}</span>
                        <span className={cn('text-sm font-bold', scoreColorClass(s.score))}>{s.score}/100</span>
                      </div>
                      <Progress value={s.score} color={scoreProgressColor(s.score)} size="md" />
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-main flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recent activity
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')}>View all</Button>
            </div>
            {loading ? (
              <LoadingState message="Loading sessions..." />
            ) : sessions.length === 0 ? (
              <EmptyState icon={<Calendar className="h-8 w-8" />} title="No sessions yet" description="Start practicing to see your activity here." />
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 8).map((s) => {
                  const Icon = typeIcon(s.type);
                  return (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                        s.type === 'english' ? 'bg-brand-500/10 text-brand-500' :
                        s.type === 'coding' ? 'bg-success-500/10 text-success-500' :
                        s.type === 'interview' ? 'bg-accent-500/10 text-accent-500' :
                        'bg-warning-500/10 text-warning-500'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-main truncate">{s.title ?? `${s.category} session`}</p>
                        <p className="text-xs text-muted">{timeAgo(s.started_at)} · {formatTime(s.duration_seconds)}</p>
                      </div>
                      {s.score !== null && (
                        <Badge variant={s.score >= 80 ? 'success' : s.score >= 60 ? 'warning' : 'error'}>
                          {s.score}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: goals, companies, achievements */}
        <div className="space-y-6">
          {/* Goals */}
          <Card>
            <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Goals
            </h3>
            {profile?.goals?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((g) => (
                  <Badge key={g} variant="primary">{g}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No goals set yet.</p>
            )}
          </Card>

          {/* Companies */}
          <Card>
            <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent-500" />
              Target companies
            </h3>
            {profile?.preferred_companies?.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.preferred_companies.map((c) => (
                  <Badge key={c} variant="accent">{c}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No target companies set.</p>
            )}
          </Card>

          {/* Achievements */}
          <Card>
            <h3 className="font-display font-semibold text-main mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-success-500" />
              Achievements
            </h3>
            {achievements.length === 0 ? (
              <EmptyState icon={<Award className="h-8 w-8" />} title="No achievements yet" description="Keep practicing to unlock badges!" />
            ) : (
              <div className="space-y-2">
                {achievements.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                    <div className="h-9 w-9 rounded-lg surface-2 border border-app flex items-center justify-center shrink-0">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">{a.title}</p>
                      <p className="text-xs text-muted">{timeAgo(a.unlocked_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CTA */}
          <Card className="relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display font-semibold text-main">Ready to grow?</h3>
              </div>
              <p className="text-sm text-muted mb-4">Jump back into practice and keep your streak alive.</p>
              <Button className="w-full" onClick={() => navigate('/app')} >
                Go to dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
