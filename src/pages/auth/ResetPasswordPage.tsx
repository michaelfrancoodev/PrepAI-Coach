import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ResetPasswordPage() {
  useDocumentTitle('Set a new password');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setDone(true);
      setTimeout(() => navigate('/app/dashboard'), 2000);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="Your new password is active.">
        <div className="text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-success-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-success-500" />
          </div>
          <p className="text-main font-medium break-words">All set! Redirecting you to your dashboard...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-error-500/30 bg-error-500/5 px-4 py-3 text-sm text-error-600 dark:text-error-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="min-w-0">{error}</span>
          </div>
        )}
        <Input
          label="New password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          leftIcon={<Lock className="h-4 w-4" />}
          required
          hint="At least 8 characters, one uppercase, one number"
        />
        <Button type="submit" className="w-full" loading={loading} size="lg" disabled={!valid}>
          Update password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
