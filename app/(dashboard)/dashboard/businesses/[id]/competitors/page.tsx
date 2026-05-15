'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompetitorRow } from '@/components/dashboard/CompetitorRow';
import { AddCompetitorModal } from '@/components/modals/AddCompetitorModal';
import {
  getBusiness,
  getCompetitorsForBusiness,
  type Business,
  type Competitor,
} from '@/lib/db';


export default function CompetitorsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [business, setBusiness] = useState<Business | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add competitor
        </Button>
      </div>

      {competitors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No competitors yet"
          description="Add your first competitor to get started."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              Add competitor
            </Button>
          }
        />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <CompetitorRow
                  key={c.id}
                  competitor={c}
                  onStatusChange={(updated) => {
                    setCompetitors(
                      competitors.map((comp) => (comp.id === updated.id ? updated : comp)),
                    );
                  }}
                  onRemove={(id) => {
                    setCompetitors(competitors.filter((comp) => comp.id !== id));
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add competitor modal */}
      {business && (
        <AddCompetitorModal
          businessId={business.id}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(newCompetitor) => {
            setCompetitors([...competitors, newCompetitor]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
