import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ForgotPasswordPage() {
  useDocumentTitle('Reset your password');
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-success-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-success-500" />
          </div>
          <p className="text-main font-medium">Check your inbox</p>
          <p className="text-sm text-muted break-words">We've sent a password reset link to <strong className="text-main break-all">{email}</strong>. The link expires in 1 hour.</p>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline min-h-[40px]">
            <ArrowLeft className="h-4 w-4 shrink-0" /> Back to login
          </Link>
        </div>
      ) : (
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
          />
          <Button type="submit" className="w-full" loading={loading} size="lg">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
