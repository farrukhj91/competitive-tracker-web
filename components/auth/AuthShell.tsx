import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

const proof = [
  'Two or three things worth acting on. Not a feed.',
  'Every claim links back to the evidence behind it.',
  'Silent when nothing strategic happened that week.',
];

interface AuthShellProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Rendered under the card, centred. */
  footer?: ReactNode;
}

/**
 * Split auth layout — ink panel carrying the pitch on the left, form on the
 * right. Collapses to the form alone below lg.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Ink panel */}
      <div className="hidden lg:flex surface-ink-wash flex-col justify-between p-12">
        <Logo light />

        <div className="max-w-md">
          <p className="display text-[2.5rem] leading-[1.1] font-semibold text-white mb-8 balance">
            Know what to build next.
          </p>
          <ul className="space-y-4">
            {proof.map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span
                  className="h-1 w-1 rounded-full bg-indigo-400 flex-shrink-0 mt-2.5"
                  aria-hidden="true"
                />
                <span className="text-[15px] text-zinc-400 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px] text-zinc-500">
          Early access · Building in the open
        </p>
      </div>

      {/* Form side */}
      <div className="flex flex-col bg-white">
        <header className="lg:hidden px-6 py-6">
          <Logo />
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12 lg:py-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900 mb-2">
                {title}
              </h1>
              {subtitle && <p className="text-sm text-zinc-500 leading-relaxed">{subtitle}</p>}
            </div>

            {children}

            {footer && <div className="mt-8">{footer}</div>}
          </div>
        </main>

        <footer className="px-6 pb-8 lg:pb-10">
          <p className="text-center text-xs text-zinc-400">
            <Link href="/" className="hover:text-zinc-600 transition-colors duration-200">
              ← Back to home
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
