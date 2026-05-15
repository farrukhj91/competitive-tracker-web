'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen grain hero-bg flex flex-col">
      <header className="px-6 md:px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl
                            bg-indigo-50 text-indigo-600 mb-5">
              <Mail className="h-5 w-5" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-zinc-600 mb-6">
              We sent a confirmation link to{' '}
              <span className="font-medium text-zinc-900">{email || 'your email'}</span>
            </p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-indigo-900 leading-relaxed">
                Click the link in the email to confirm your account. You&apos;ll be signed in
                automatically and taken to your dashboard.
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              Didn&apos;t get it? Check your spam folder, or{' '}
              <Link
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                try signing up again
              </Link>
              .
            </p>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-6">
            <Link href="/" className="hover:text-zinc-700 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Confirm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
