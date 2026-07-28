import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function getInitials(name?: string | null): string {
  if (!name) return 'NC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={cn('rounded-full object-cover ring-2 ring-app', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-full surface-2 border border-app text-primary font-semibold flex items-center justify-center ring-2 ring-app',
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
