import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, ChevronDown, Sparkles } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { PUBLIC_NAV } from '@/components/nav-config';
import { cn } from '@/lib/utils';

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme, resolved } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const ThemeIcon = resolved === 'dark' ? Moon : Sun;

  return (
    <div className="min-h-screen flex flex-col bg-app">
      <header className="sticky top-0 z-40 glass border-b border-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size="sm" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {PUBLIC_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn('nav-link px-3 py-2 rounded-lg', isActive && 'active surface-2')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setThemeOpen((v) => !v)}
                  className="btn-ghost !p-2"
                  title="Theme"
                >
                  <ThemeIcon className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
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
                        onClick={() => {
                          setTheme(t.id as 'light' | 'dark' | 'system');
                          setThemeOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          theme === t.id ? 'bg-primary/10 text-primary' : 'text-muted hover:surface-2 hover:text-main',
                        )}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <Button size="sm" onClick={() => navigate('/app/dashboard')} leftIcon={<Sparkles className="h-4 w-4" />}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Log in
                  </Button>
                  <Button size="sm" onClick={() => navigate('/register')} className="hidden sm:inline-flex">
                    Get started free
                  </Button>
                </>
              )}

              <button onClick={() => setMobileOpen((v) => !v)} className="btn-ghost lg:hidden !p-2">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="lg:hidden py-3 border-t border-app space-y-1">
              {PUBLIC_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn('block px-3 py-2.5 rounded-lg text-sm font-medium', isActive ? 'surface-2 text-primary' : 'text-muted hover:surface-2')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {!user && (
                <div className="pt-2 space-y-2">
                  <Button variant="secondary" className="w-full" onClick={() => { setMobileOpen(false); navigate('/login'); }}>
                    Log in
                  </Button>
                  <Button className="w-full" onClick={() => { setMobileOpen(false); navigate('/register'); }}>
                    Get started free
                  </Button>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-app surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Logo size="sm" />
              <p className="mt-3 text-sm text-muted max-w-xs">
                AI-powered interview and English speaking coach. Practice daily, get feedback, land your dream job.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-main mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="text-muted hover:text-main">Features</Link></li>
                <li><Link to="/how-it-works" className="text-muted hover:text-main">How It Works</Link></li>
                <li><Link to="/pricing" className="text-muted hover:text-main">Pricing</Link></li>
                <li><Link to="/roadmap" className="text-muted hover:text-main">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-main mb-3">Practice</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/practice-categories" className="text-muted hover:text-main">Categories</Link></li>
                <li><Link to="/faq" className="text-muted hover:text-main">FAQ</Link></li>
                <li><Link to="/about" className="text-muted hover:text-main">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-main mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="text-muted hover:text-main">Log in</Link></li>
                <li><Link to="/register" className="text-muted hover:text-main">Sign up</Link></li>
                <li><Link to="/app/dashboard" className="text-muted hover:text-main">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-app flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted">© {new Date().getFullYear()} PrepAI. Built for serious learners.</p>
            <p className="text-xs text-muted">Made with AI · Practice makes confident</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
