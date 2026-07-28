import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'surface border border-app text-muted',
  primary: 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400 border border-warning-500/20',
  error: 'bg-error-500/10 text-error-600 dark:text-error-400 border border-error-500/20',
  accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-300 border border-accent-500/20',
};

export function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
