'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { CheckCircle, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session?.user) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Subscribe to auth changes — handles the case where the session
    // cookie is set just after the page loads (e.g., right after email
    // verification callback redirects here).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (!session?.user) {
          router.push('/login');
        } else {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-gray-600 flex items-center gap-4">
            <span>{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-blue-600 hover:text-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {showWelcome && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Welcome aboard! 🎉</p>
                <p className="text-sm text-green-700 mt-1">
                  Your email has been verified and you're signed in. Add your first business below to start tracking competitors.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-green-600 hover:text-green-800"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-8">My Businesses</h2>
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-6">
            Coming soon! You'll be able to add and manage your businesses here.
          </p>
          <p className="text-gray-600 text-sm">
            In the next session, we'll build the business list and competitor tracking interface.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
