import type { ReactNode } from 'react';

type Tone = 'neutral' | 'indigo' | 'success' | 'warning' | 'destructive';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

/* Tinted fills, no hard borders — borders on small chips read as clutter
   at this size and fight the hairline rhythm of the rest of the page. */
const tones: Record<Tone, string> = {
  neutral: 'bg-zinc-100 text-zinc-600',
  indigo: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  destructive: 'bg-red-50 text-red-600',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ' +
        `text-[11px] font-medium leading-none ${tones[tone]} ${className}`
      }
    >
      {children}
    </span>
  );
}
