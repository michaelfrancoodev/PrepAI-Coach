import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, defaultTab, className, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  const handle = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-app surface rounded-xl p-1 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handle(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0',
              active === t.id
                ? 'bg-primary text-primary-fg'
                : 'text-muted hover:text-main hover:surface-2',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in">{activeTab?.content}</div>
    </div>
  );
}
