'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Businesses', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0
                      bg-white border-r border-zinc-200">
      <div className="px-6 py-5 border-b border-zinc-200">
        <Logo />
      </div>

      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <Link
          href="/dashboard/businesses/new"
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg
                     bg-zinc-900 text-white text-sm font-medium
                     hover:bg-zinc-800 active:bg-zinc-700
                     transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          New business
        </Link>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ' +
                'transition-all duration-200 ' +
                (isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900')
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-3 py-4 border-t border-zinc-200">
        <p className="text-xs text-zinc-500 px-3">
          v0.2 · Session 2
        </p>
      </div>
    </aside>
  );
}
