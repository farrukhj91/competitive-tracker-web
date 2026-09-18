'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        <>
          We sent a confirmation link to{' '}
          <span className="font-medium text-zinc-900">{email || 'your email'}</span>
        </>
      }
      footer={
        <p className="text-center text-xs text-zinc-400 leading-relaxed">
          Didn&rsquo;t get it? Check your spam folder, or{' '}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
          >
            try signing up again
          </Link>
          .
        </p>
      }
    >
      <div className="rounded-2xl bg-zinc-50 p-6">
        <span
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white text-indigo-600 elev-1 mb-4"
          aria-hidden="true"
        >
          <Mail className="h-[18px] w-[18px]" />
        </span>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Click the link in the email to confirm your account. You&rsquo;ll be signed in
          automatically and taken to your dashboard.
        </p>
      </div>
    </AuthShell>
  );
}

export default function Confirm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">
          Loading…
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
