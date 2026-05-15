'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Users,
  FileText,
  Calendar,
  Play,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getBusiness,
  getCompetitorsForBusiness,
  getReportsForBusiness,
  type Business,
  type Competitor,
  type Report,
} from '@/lib/db';

function formatDate(d?: string | null) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function cleanUrl(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function BusinessView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [business, setBusiness] = useState<Business | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    Promise.all([
      getBusiness(id),
      getCompetitorsForBusiness(id),
      getReportsForBusiness(id, 5),
    ]).then(([b, comps, reps]) => {
      if (!mounted) return;
      if (!b) {
        setNotFound(true);
      } else {
        setBusiness(b);
        setCompetitors(comps);
        setReports(reps);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse mb-6" />
        <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-zinc-200 rounded animate-pulse mb-8" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
        <EmptyState
          icon={FileText}
          title="Business not found"
          description="It may have been removed, or you don't have access to it."
          action={
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to dashboard
            </Button>
          }
        />
      </div>
    );
  }

  const activeCount = competitors.filter((c) => c.is_active).length;
  const lastReport = reports[0];

  return (
    <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900
                   transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl
                          bg-gradient-to-br from-indigo-500 to-indigo-700 text-white
                          font-semibold shadow-sm flex-shrink-0">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 truncate">
              {business.name}
            </h1>
            {business.url && (
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-600
                           hover:text-indigo-600 transition-colors mt-1"
              >
                <Globe className="h-3.5 w-3.5" />
                {cleanUrl(business.url)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <Button leftIcon={<Play className="h-4 w-4" />}>
          Trigger crawl
        </Button>
      </div>

      {/* Description */}
      {business.description && (
        <p className="text-base text-zinc-700 leading-relaxed mb-8 max-w-3xl">
          {business.description}
        </p>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Stat label="Competitors" value={competitors.length} sub={`${activeCount} active`} icon={Users} />
        <Stat label="Reports generated" value={reports.length} sub="Last 30 days" icon={FileText} />
        <Stat
          label="Last crawl"
          value={formatDate(lastReport?.report_date)}
          sub={lastReport ? 'Daily at 3 AM UTC' : 'Not yet run'}
          icon={Calendar}
        />
      </div>

      {/* Tabs replaced with two clear sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitors panel */}
        <section className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Competitors</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {competitors.length} tracked · {activeCount} active
              </p>
            </div>
            <Link href={`/dashboard/businesses/${business.id}/competitors`}>
              <Button variant="secondary" size="sm">
                Manage
              </Button>
            </Link>
          </div>
          {competitors.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600 mb-3">No competitors yet.</p>
              <Link href={`/dashboard/businesses/${business.id}/competitors`}>
                <Button size="sm">Add competitor</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {competitors.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{c.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{cleanUrl(c.url)}</p>
                  </div>
                  {c.is_active ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Paused</Badge>
                  )}
                </li>
              ))}
              {competitors.length > 6 && (
                <li className="px-6 py-3 text-xs text-zinc-500 text-center">
                  + {competitors.length - 6} more
                </li>
              )}
            </ul>
          )}
        </section>

        {/* Reports panel */}
        <section className="bg-white border border-zinc-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">Recent reports</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Last {reports.length}</p>
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-600">
                No reports yet. The first one runs after the next daily crawl.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {reports.map((r) => (
                <li key={r.id} className="px-6 py-3 hover:bg-zinc-50 transition-colors">
                  <Link
                    href={`/dashboard/businesses/${business.id}/reports/${r.id}`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{formatDate(r.report_date)}</p>
                      <p className="text-xs text-zinc-500">
                        {r.sent_at ? `Sent ${formatDate(r.sent_at)}` : 'Generated'}
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-zinc-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: typeof Users;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
        {value}
      </div>
      <div className="text-xs text-zinc-500 mt-1">{sub}</div>
    </div>
  );
}
