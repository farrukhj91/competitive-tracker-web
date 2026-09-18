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
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-zinc-200/70">
      <div className="flex items-center justify-between h-16 px-6 md:px-8">
        <div>
          {title && (
            <h1 className="text-[15px] font-semibold text-zinc-900 tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 pl-1 pr-2 h-10 rounded-full
                       hover:bg-zinc-100 active:bg-zinc-200
                       transition-colors duration-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span
              className="inline-flex items-center justify-center h-8 w-8 rounded-full
                         bg-zinc-900 text-white text-xs font-semibold"
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="hidden sm:inline text-[13px] text-zinc-600">{user.email}</span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-zinc-200/70
                         bg-white elev-2 p-1.5 z-50"
            >
              <div className="px-2.5 py-2.5 mb-1 border-b border-zinc-200/70">
                <p className="text-[11px] text-zinc-400">Signed in as</p>
                <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => router.push('/dashboard/settings')}
                className="flex items-center gap-2.5 w-full px-2.5 h-9 rounded-lg text-[13px] text-zinc-700
                           hover:bg-zinc-100 transition-colors duration-200"
              >
                <UserIcon className="h-4 w-4 text-zinc-500" />
                Account settings
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-2.5 h-9 rounded-lg text-[13px] text-red-600
                           hover:bg-red-50 transition-colors duration-200"
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
