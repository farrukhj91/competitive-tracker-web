'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, CheckCircle2, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BusinessCard, type BusinessCardData } from '@/components/dashboard/BusinessCard';
import { listBusinessesForCurrentUser } from '@/lib/db';

function DashboardContent() {
  const [businesses, setBusinesses] = useState<BusinessCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') setShowWelcome(true);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    listBusinessesForCurrentUser()
      .then((rows) => {
        if (!mounted) return;
        setBusinesses(
          rows.map((b) => ({
            id: b.id,
            name: b.name,
            url: b.url,
            description: b.description,
            competitor_count: b.competitor_count,
            last_report_date: b.last_report_date,
            is_paused: b.is_paused ?? false,
          })),
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
      {showWelcome && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4
                        flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Welcome aboard.</p>
              <p className="text-sm text-emerald-800 mt-0.5">
                Your email is verified. Add your first business to start tracking competitors.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="text-emerald-700 hover:text-emerald-900 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
            Businesses
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Track competitor activity for each of your businesses.
          </p>
        </div>
        <Link href="/dashboard/businesses/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New business</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-zinc-200 rounded-xl p-6 h-44 animate-pulse"
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-200 mb-4" />
              <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2" />
              <div className="h-3 w-1/2 bg-zinc-200 rounded mb-6" />
              <div className="h-3 w-full bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description="Add your first business to start tracking competitor pricing, features, hiring, and news."
          action={
            <Link href="/dashboard/businesses/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add a business</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-8" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
