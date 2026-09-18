import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md';
  /** Use on ink backgrounds — flips the mark and wordmark to white. */
  light?: boolean;
  /** Hide the wordmark below the sm breakpoint — for tight nav bars. */
  compact?: boolean;
}

export function Logo({ href = '/', size = 'md', light = false, compact = false }: LogoProps) {
  const box = size === 'sm' ? 'h-6 w-6 rounded-[7px]' : 'h-7 w-7 rounded-lg';
  const glyph = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-[13px]' : 'text-[15px]';

  return (
    <Link
      href={href}
      className={
        'group inline-flex items-center gap-2.5 font-semibold tracking-tight ' +
        'transition-opacity duration-200 hover:opacity-70 ' +
        (light ? 'text-white' : 'text-zinc-900')
      }
    >
      <span
        className={
          'inline-flex items-center justify-center ' +
          (light ? 'bg-white text-zinc-900 ' : 'bg-zinc-900 text-white ') +
          box
        }
        aria-hidden="true"
      >
        {/* Converging signals: three lines narrowing to a single point */}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={glyph}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <path d="M2.5 4h4.5" opacity="0.55" />
          <path d="M2.5 8h7.5" />
          <path d="M2.5 12h4.5" opacity="0.55" />
          <circle cx="12.4" cy="8" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className={textSize + (compact ? ' hidden sm:inline' : '')}>Competitive Tracker</span>
    </Link>
  );
}
