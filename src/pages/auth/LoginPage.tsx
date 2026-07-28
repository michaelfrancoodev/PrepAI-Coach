import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function LoginPage() {
  useDocumentTitle('Log in');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      const from = (location.state as { from?: string })?.from ?? '/app/dashboard';
      navigate(from);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your practice journey.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-error-500/30 bg-error-500/5 px-4 py-3 text-sm text-error-600 dark:text-error-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="min-w-0">{error}</span>
          </div>
        )}
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          leftIcon={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="h-4 w-4 rounded border-app shrink-0" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-primary hover:underline sm:shrink-0">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={loading} size="lg">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Sign up free</Link>
      </p>
    </AuthLayout>
  );
}
