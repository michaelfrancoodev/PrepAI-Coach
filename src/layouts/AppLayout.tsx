import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Bell,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Flame,
  Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useData';
import { APP_NAV } from '@/components/nav-config';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme, resolved } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { notifications, markAllRead, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const ThemeIcon = resolved === 'dark' ? Moon : Sun;
  const streak = profile?.streak_count ?? 0;

  const closeAll = () => {
    setNotifOpen(false);
    setProfileOpen(false);
    setThemeOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const currentTitle = (() => {
    for (const section of APP_NAV) {
      for (const item of section.items) {
        if (location.pathname.startsWith(item.path)) return item.label;
      }
    }
    return 'Dashboard';
  })();

  return (
    <div className="min-h-screen bg-app flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 surface border-r border-app flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-app">
          <Link to="/app/dashboard" onClick={() => setSidebarOpen(false)}>
            <Logo size="sm" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="btn-ghost !p-1.5 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {APP_NAV.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted hover:surface-2 hover:text-main',
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-app p-3">
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl surface-2 mb-2">
              <Flame className="h-4 w-4 text-warning-500" />
              <span className="text-sm font-medium text-main">{streak} day streak</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:surface-2 hover:text-main transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-app">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="btn-ghost !p-2 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-display text-lg font-semibold text-main hidden sm:block">{currentTitle}</h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/app/coach/ask')}
                className="btn-ghost !p-2 hidden sm:inline-flex"
                title="Ask AI"
              >
                <Sparkles className="h-[18px] w-[18px]" />
              </button>

              <div className="relative">
                <button onClick={() => { closeAll(); setNotifOpen((v) => !v); }} className="btn-ghost !p-2 relative" title="Notifications">
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error-500" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 card p-0 z-50 max-h-96 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-app">
                      <span className="font-semibold text-sm text-main">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-sm text-muted text-center">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
                            className={cn('w-full text-left px-4 py-3 border-b border-app hover:surface-2 transition-colors', !n.read && 'bg-primary/5')}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-main">{n.title}</p>
                                {n.body && <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>}
                                <p className="text-[11px] text-muted mt-1">{timeAgo(n.created_at)}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => { closeAll(); setThemeOpen((v) => !v); }} className="btn-ghost !p-2" title="Theme">
                  <ThemeIcon className="h-[18px] w-[18px]" />
                </button>
                {themeOpen && (
                  <div className="absolute right-0 mt-2 w-36 card p-1 z-50">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id as 'light' | 'dark' | 'system'); setThemeOpen(false); }}
                        className={cn('flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm', theme === t.id ? 'bg-primary/10 text-primary' : 'text-muted hover:surface-2 hover:text-main')}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => { closeAll(); setProfileOpen((v) => !v); }} className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:surface-2 transition-colors">
                  <Avatar name={profile?.display_name} src={profile?.avatar_url} size="sm" />
                  <ChevronDown className="h-4 w-4 text-muted hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 card p-1 z-50">
                    <div className="px-3 py-2.5 border-b border-app">
                      <p className="text-sm font-semibold text-main truncate">{profile?.display_name ?? 'Learner'}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                      {profile?.target_role && <Badge variant="primary" className="mt-1.5">{profile.target_role}</Badge>}
                    </div>
                    <button onClick={() => { setProfileOpen(false); navigate('/app/settings'); }} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:surface-2 hover:text-main">
                      <SettingsIcon className="h-4 w-4" /> Settings
                    </button>
                    <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:surface-2 hover:text-main">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
