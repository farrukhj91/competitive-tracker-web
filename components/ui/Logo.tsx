import Link from 'next/link';
import { Activity } from 'lucide-react';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md';
}

export function Logo({ href = '/', size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900
                 hover:text-zinc-700 transition-colors duration-200"
    >
      <span
        className="inline-flex items-center justify-center h-7 w-7 rounded-lg
                   bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm"
        aria-hidden="true"
      >
        <Activity className={iconSize} strokeWidth={2.5} />
      </span>
      <span className={textSize}>Competitive Tracker</span>
    </Link>
  );
}
