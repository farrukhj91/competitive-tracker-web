'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getBusiness,
  getCompetitorsForBusiness,
  type Business,
  type Competitor,
} from '@/lib/db';

function cleanUrl(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function CompetitorsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [business, setBusiness] = useState<Business | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    Promise.all([getBusiness(id), getCompetitorsForBusiness(id)]).then(([b, comps]) => {
      if (!mounted) return;
      setBusiness(b);
      setCompetitors(comps);
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
        <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-10 max-w-7xl mx-auto">
      <Link
        href={business ? `/dashboard/businesses/${business.id}` : '/dashboard'}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900
                   transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {business?.name || 'business'}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
            Competitors
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            {competitors.length} tracked for {business?.name}
          </p>
        </div>
        <Button disabled title="Add competitor — coming in Session 3">
          Add competitor
        </Button>
      </div>

      {competitors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No competitors yet"
          description="Competitor management UI will be wired up in Session 3 (with add/edit/pause/remove + Claude-assisted discovery)."
        />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <Th>Name</Th>
                <Th>Website</Th>
                <Th>LinkedIn</Th>
                <Th>Status</Th>
                <Th className="text-right">Added</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {competitors.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <Td>
                    <span className="font-medium text-zinc-900">{c.name}</span>
                  </Td>
                  <Td>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-zinc-700
                                   hover:text-indigo-600 transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        {cleanUrl(c.url)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </Td>
                  <Td>
                    {c.linkedin_url ? (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-700 hover:text-indigo-600 transition-colors"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </Td>
                  <Td>
                    {c.is_active ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="neutral">Paused</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <span className="text-xs text-zinc-500 tabular-nums">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-zinc-700 ${className}`}>{children}</td>;
}
