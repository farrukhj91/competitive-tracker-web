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
        `flex flex-col items-center justify-center text-center ` +
        `bg-white border border-dashed border-zinc-300 rounded-xl p-12 ${className}`
      }
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 mb-4">
        <Icon className="h-6 w-6 text-zinc-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-600 max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
