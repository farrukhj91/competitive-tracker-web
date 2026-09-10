import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md';
  /** Use on dark backgrounds — flips the wordmark to white. */
  light?: boolean;
}

export function Logo({ href = '/', size = 'md', light = false }: LogoProps) {
  const box = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const glyph = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <Link
      href={href}
      className={
        'group inline-flex items-center gap-2.5 font-semibold tracking-tight transition-colors duration-200 ' +
        (light ? 'text-white hover:text-zinc-200' : 'text-zinc-900 hover:text-zinc-700')
      }
    >
      <span
        className={
          'relative inline-flex items-center justify-center rounded-lg chip-gradient ' +
          'shadow-lg shadow-indigo-500/25 transition-transform duration-300 ' +
          'group-hover:scale-105 ' +
          box
        }
        aria-hidden="true"
      >
        {/* Converging-signals mark: three lines narrowing to a point */}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={glyph}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M2 3.5h5" opacity="0.65" />
          <path d="M2 8h8" />
          <path d="M2 12.5h5" opacity="0.65" />
          <circle cx="12.5" cy="8" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className={textSize}>Competitive Tracker</span>
    </Link>
  );
}
