import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

export function RegisterPage() {
  useDocumentTitle('Create your account');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const allValid = checks.length && checks.upper && checks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!allValid) {
      setError('Please choose a stronger password.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <AuthLayout title="Create your free account" subtitle="Start practicing with your AI coach in seconds.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-error-500/30 bg-error-500/5 px-4 py-3 text-sm text-error-600 dark:text-error-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="min-w-0">{error}</span>
          </div>
        )}
        <Input
          label="Display name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          leftIcon={<User className="h-4 w-4" />}
          required
          autoComplete="name"
        />
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
        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            leftIcon={<Lock className="h-4 w-4" />}
            required
            autoComplete="new-password"
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              {[
                { ok: checks.length, label: 'At least 8 characters' },
                { ok: checks.upper, label: 'One uppercase letter' },
                { ok: checks.number, label: 'One number' },
              ].map((c) => (
                <div key={c.label} className={cn('flex items-center gap-1.5 text-xs py-0.5', c.ok ? 'text-success-600 dark:text-success-400' : 'text-muted')}>
                  <Check className="h-3 w-3 shrink-0" />
                  <span className="min-w-0">{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" className="w-full" loading={loading} size="lg" disabled={!allValid}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
