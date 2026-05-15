'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Mail, Bell, Plug, Crown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="px-6 md:px-8 py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
          Settings
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Manage your account, notifications, and integrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <Section title="Account" description="Your sign-in info.">
          <div className="space-y-4">
            <Field label="Email">
              {loading ? (
                <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse" />
              ) : (
                <span className="text-sm text-zinc-900 font-medium">{user?.email}</span>
              )}
            </Field>
            <Field label="Account created">
              {loading ? (
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse" />
              ) : (
                <span className="text-sm text-zinc-700">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              )}
            </Field>
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan" description="Your current subscription tier.">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                               bg-zinc-100 text-zinc-700">
                <Crown className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900">Free</span>
                  <Badge tone="neutral">1 business</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Upgrade to Pro for unlimited businesses, Slack alerts, and webhooks.
                </p>
              </div>
            </div>
            <Button variant="secondary" disabled title="Billing comes in a later session">
              Upgrade
            </Button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" description="How you receive competitor updates.">
          <div className="space-y-3">
            <NotificationRow
              icon={Mail}
              title="Email reports"
              description="Daily competitive briefing in your inbox + PDF attachment."
              status="enabled"
            />
            <NotificationRow
              icon={Bell}
              title="Slack notifications"
              description="Real-time alerts for material competitor changes."
              status="pro-only"
            />
            <NotificationRow
              icon={Plug}
              title="Webhooks"
              description="Pipe events to your own backend or Zapier."
              status="pro-only"
            />
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone" description="Irreversible actions.">
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-3 rounded-lg
                         border border-zinc-200 bg-white hover:bg-zinc-50
                         transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                                 bg-zinc-100 text-zinc-600">
                  <LogOut className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">Sign out</p>
                  <p className="text-xs text-zinc-500">End your session on this device.</p>
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between w-full p-3 rounded-lg
                            border border-red-200 bg-red-50/50">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                                 bg-red-100 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-red-900">Delete account</p>
                  <p className="text-xs text-red-700">
                    Removes all your businesses, competitors, and reports permanently.
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-b-0">
      <span className="text-sm text-zinc-600">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  status: 'enabled' | 'pro-only';
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                         bg-zinc-100 text-zinc-600 flex-shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{title}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      {status === 'enabled' ? (
        <Badge tone="success">Enabled</Badge>
      ) : (
        <Badge tone="indigo">Pro</Badge>
      )}
    </div>
  );
}
