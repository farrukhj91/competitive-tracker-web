'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.user) {
        router.push(`/confirm?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain hero-bg flex flex-col">
      <header className="px-6 md:px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-1">
                Create your account
              </h1>
              <p className="text-sm text-zinc-600">
                Start tracking competitors in under a minute.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Use 8+ characters with a mix of letters and numbers."
              />

              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-600 mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-6">
            By creating an account, you agree to our terms and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}
