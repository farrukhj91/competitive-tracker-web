import type { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={
        'flex flex-col items-center justify-center text-center ' +
        `bg-zinc-50 border border-zinc-200/70 rounded-2xl px-8 py-14 ${className}`
      }
    >
      <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-white elev-1 mb-5">
        <Icon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
      </div>
      <h3 className="text-[17px] font-semibold text-zinc-900 tracking-tight mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-7">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
