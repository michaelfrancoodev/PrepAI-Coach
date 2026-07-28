import { useNavigate } from 'react-router-dom';
import {
  Network,
  Link2,
  MessageSquare,
  Hash,
  Play,
  Film,
  Car,
  Newspaper,
  Search,
  Gauge,
  Database,
  Mail,
  Bell,
  FolderOpen,
  Clock,
  TrendingUp,
  Bookmark,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/Feedback';
import { useSessions, useBookmarks } from '@/hooks/useData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn, timeAgo, formatTime } from '@/lib/utils';

type Difficulty = 'easy' | 'medium' | 'hard';

interface SystemDesignProblem {
  slug: string;
  title: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  blurb: string;
  gradient: string;
}

const PROBLEMS: SystemDesignProblem[] = [
  { slug: 'url-shortener', title: 'URL Shortener', icon: Link2, difficulty: 'easy', blurb: 'Design a service like bit.ly that shortens long URLs and handles redirects at scale.', gradient: 'surface-2 border border-app' },
  { slug: 'chat-system', title: 'Chat System', icon: MessageSquare, difficulty: 'medium', blurb: 'Design a real-time messaging system supporting 1:1 and group chats with presence and delivery guarantees.', gradient: 'surface-2 border border-app' },
  { slug: 'twitter', title: 'Twitter / X', icon: Hash, difficulty: 'hard', blurb: 'Design a social media platform with timeline generation, fan-out, and trending topics at massive scale.', gradient: 'surface-2 border border-app' },
  { slug: 'netflix', title: 'Netflix', icon: Film, difficulty: 'hard', blurb: 'Design a video streaming platform with CDN strategy, encoding pipelines, and global content delivery.', gradient: 'surface-2 border border-app' },
  { slug: 'ride-sharing', title: 'Ride Sharing (Uber)', icon: Car, difficulty: 'hard', blurb: 'Design a ride-sharing platform with real-time location tracking, matching, and surge pricing.', gradient: 'surface-2 border border-app' },
  { slug: 'news-feed', title: 'News Feed', icon: Newspaper, difficulty: 'hard', blurb: 'Design a ranked news feed with content generation, ranking algorithms, and personalization.', gradient: 'surface-2 border border-app' },
  { slug: 'search-autocomplete', title: 'Search Autocomplete', icon: Search, difficulty: 'medium', blurb: 'Design a typeahead/autocomplete service returning suggestions in real time as users type.', gradient: 'surface-2 border border-app' },
  { slug: 'rate-limiter', title: 'Rate Limiter', icon: Gauge, difficulty: 'medium', blurb: 'Design a distributed rate limiting service supporting token bucket and sliding window algorithms.', gradient: 'surface-2 border border-app' },
  { slug: 'distributed-cache', title: 'Distributed Cache', icon: Database, difficulty: 'medium', blurb: 'Design a distributed caching layer with eviction policies, consistency, and failover.', gradient: 'surface-2 border border-app' },
  { slug: 'message-queue', title: 'Message Queue', icon: Mail, difficulty: 'hard', blurb: 'Design a durable message queue supporting pub/sub, ordering, and at-least-once delivery.', gradient: 'surface-2 border border-app' },
  { slug: 'notification-system', title: 'Notification System', icon: Bell, difficulty: 'medium', blurb: 'Design a multi-channel notification system supporting email, SMS, and push at scale.', gradient: 'surface-2 border border-app' },
  { slug: 'file-storage', title: 'File Storage', icon: FolderOpen, difficulty: 'hard', blurb: 'Design a file storage service like Google Drive or Dropbox with syncing and sharing.', gradient: 'surface-2 border border-app' },
];

function diffVariant(d: Difficulty): 'success' | 'warning' | 'error' {
  return d === 'easy' ? 'success' : d === 'medium' ? 'warning' : 'error';
}

export function SystemDesignHomePage() {
  useDocumentTitle('System Design');
  const navigate = useNavigate();
  const { sessions, loading } = useSessions(50);
  const { items: bookmarks } = useBookmarks();

  const sdSessions = sessions.filter((s) => s.type === 'system_design');
  const completed = sdSessions.filter((s) => s.status === 'completed');
  const totalMinutes = Math.round(sdSessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);
  const avgScore = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.score ?? 0), 0) / completed.length)
    : 0;

  const savedDesigns = bookmarks.filter((b) => b.type === 'system_design');
  const recentSessions = sdSessions.slice(0, 5);

  return (
    <AppLayout>
      <PageHeader
        title="System Design Practice"
        description="Master scalable architecture interviews with classic system design problems. Clarify requirements, draw boxes, and justify trade-offs."
        icon={<Network className="h-5 w-5" />}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/coach/ask')}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            Ask the Coach
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Network} label="SD sessions" value={String(sdSessions.length)} color="text-primary" />
        <StatCard icon={Clock} label="Total minutes" value={String(totalMinutes)} color="text-accent-500" />
        <StatCard icon={TrendingUp} label="Avg score" value={`${avgScore}`} color="text-success-500" suffix="/100" />
        <StatCard icon={Bookmark} label="Saved designs" value={String(savedDesigns.length)} color="text-warning-500" />
      </div>

      {/* Problem grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-main">Classic problems</h2>
          <span className="text-xs text-muted">{PROBLEMS.length} designs</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((p) => (
            <Card key={p.slug} hover className="group flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', p.gradient)}>
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-main truncate">{p.title}</h3>
                  <Badge variant={diffVariant(p.difficulty)} className="mt-1 capitalize">{p.difficulty}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted flex-1 mb-4 line-clamp-3">{p.blurb}</p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => navigate(`/app/system-design/${p.slug}`)}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Start
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Saved designs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-main flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" />
              Saved designs
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/learning')}>
              Manage
            </Button>
          </div>
          {savedDesigns.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-8 w-8" />}
              title="No saved designs yet"
              description="Bookmark system design notes and reference architectures to revisit them here."
            />
          ) : (
            <div className="space-y-2">
              {savedDesigns.map((b) => (
                <a
                  key={b.id}
                  href={b.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl surface-2 p-3 hover:surface transition-all"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bookmark className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-main truncate">{b.title}</p>
                    {b.note && <p className="text-xs text-muted truncate">{b.note}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted shrink-0" />
                </a>
              ))}
            </div>
          )}
        </Card>

        {/* Recent sessions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-main flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent sessions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')}>
              Analytics
            </Button>
          </div>
          {loading ? (
            <LoadingState message="Loading sessions..." />
          ) : recentSessions.length === 0 ? (
            <EmptyState
              icon={<Network className="h-8 w-8" />}
              title="No sessions yet"
              description="Start your first system design session to see it here."
              action={
                <Button size="sm" onClick={() => navigate('/app/system-design/url-shortener')}>
                  Try URL Shortener
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl surface-2 p-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Network className="h-4 w-4 text-primary" />
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
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix }: { icon: LucideIcon; label: string; value: string; color: string; suffix?: string }) {
  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <p className="font-display text-2xl font-bold text-main">
        {value}<span className="text-sm text-muted font-normal">{suffix}</span>
      </p>
    </Card>
  );
}
