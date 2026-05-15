'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

interface TopBarProps {
  user: User;
  title?: string;
  subtitle?: string;
}

export function TopBar({ user, title, subtitle }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Email initial for avatar
  const initial = (user.email || '?')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="flex items-center justify-between h-16 px-6 md:px-8">
        <div>
          {title && (
            <h1 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg
                       hover:bg-zinc-100 active:bg-zinc-200
                       transition-all duration-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span
              className="inline-flex items-center justify-center h-7 w-7 rounded-full
                         bg-gradient-to-br from-indigo-500 to-indigo-700
                         text-white text-xs font-semibold"
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="hidden sm:inline text-sm text-zinc-700">{user.email}</span>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200
                         bg-white shadow-xl py-1 z-50"
            >
              <div className="px-3 py-2.5 border-b border-zinc-200">
                <p className="text-xs text-zinc-500">Signed in as</p>
                <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => router.push('/dashboard/settings')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700
                           hover:bg-zinc-50 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-zinc-500" />
                Account settings
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600
                           hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
