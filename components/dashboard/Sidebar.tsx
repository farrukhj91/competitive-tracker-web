'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Plus, type LucideIcon } from 'lucide-react';
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
    <aside
      className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0
                 bg-white border-r border-zinc-200/70"
    >
      <div className="h-16 px-6 flex items-center">
        <Logo size="sm" />
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <Link
          href="/dashboard/businesses/new"
          className="flex items-center justify-center gap-2 h-10 mb-4 rounded-full
                     bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-700 active:bg-indigo-800
                     transition-colors duration-200
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
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
                'flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium ' +
                'transition-colors duration-200 ' +
                (isActive
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900')
              }
            >
              <Icon
                className={'h-4 w-4 ' + (isActive ? 'text-indigo-600' : 'text-zinc-400')}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-6 py-5">
        <p className="font-mono text-[10px] tracking-wider uppercase text-zinc-400">
          Early access
        </p>
      </div>
    </aside>
  );
}
