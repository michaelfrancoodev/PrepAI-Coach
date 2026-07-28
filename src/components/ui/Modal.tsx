import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full card p-0 overflow-hidden animate-scale-in flex flex-col max-h-[90vh]', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between border-b border-app px-4 sm:px-6 py-4 shrink-0">
            <h2 className="font-display text-lg font-semibold text-main">{title}</h2>
            <button onClick={onClose} className="btn-ghost !p-2 -mr-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">{children}</div>
        {footer && <div className="border-t border-app px-4 sm:px-6 py-4 surface-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
