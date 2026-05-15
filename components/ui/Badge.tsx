import type { ReactNode } from 'react';

type Tone = 'neutral' | 'indigo' | 'success' | 'warning' | 'destructive';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={
        `inline-flex items-center gap-1 px-2 py-0.5 rounded-md ` +
        `text-xs font-medium border ${tones[tone]} ${className}`
      }
    >
      {children}
    </span>
  );
}
