import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/Feedback';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState message="Loading your workspace..." className="min-h-screen" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState message="Loading..." className="min-h-screen" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (profile?.onboarding_complete && location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/app/dashboard" replace />;
  }
  if (!profile?.onboarding_complete && location.pathname.startsWith('/app')) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
