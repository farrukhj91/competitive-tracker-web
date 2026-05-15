'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data.session;
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    })();

    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-indigo-600 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="md:pl-64">
        <TopBar user={user} />
        <main>{children}</main>
      </div>
    </div>
  );
}
