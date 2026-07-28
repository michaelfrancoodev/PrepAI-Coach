import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colors = {
  primary: 'bg-primary',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  accent: 'bg-accent-500',
};

const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

export function Progress({ value, max = 100, className, color = 'primary', showLabel, size = 'md' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full surface-2 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs text-muted">{Math.round(pct)}%</div>
      )}
    </div>
  );
}
