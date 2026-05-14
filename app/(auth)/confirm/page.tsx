'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Confirm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>

        <p className="text-gray-600">
          We've sent a confirmation link to{' '}
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Click the link in the email to confirm your account and get started with tracking your competitors.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => router.push('/signup')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            try signing up again
          </button>
        </p>

        <div className="pt-4">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
