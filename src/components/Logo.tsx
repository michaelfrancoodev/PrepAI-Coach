import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'rounded bg-primary flex items-center justify-center text-primary-fg',
          dims,
        )}
      >
        <GraduationCap size={iconSize} strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <span className={cn('font-display font-bold tracking-tight text-main', textSize)}>
          Prep<span className="text-primary">AI</span>
        </span>
      </div>
    </div>
  );
}
