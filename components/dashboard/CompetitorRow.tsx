'use client';

import { useState } from 'react';
import { Pause, Play, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';

interface Competitor {
  id: string;
  business_id: string;
  name: string;
  url: string;
  is_active: boolean;
}

interface CompetitorRowProps {
  competitor: Competitor;
  onStatusChange?: (competitor: Competitor) => void;
  onRemove?: (competitorId: string) => void;
  onEdit?: (competitor: Competitor) => void;
}

export function CompetitorRow({
  competitor,
  onStatusChange,
  onRemove,
  onEdit,
}: CompetitorRowProps) {
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function cleanUrl(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  const handlePauseResume = async () => {
    setIsPending(true);
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: competitor.business_id,
          action: 'pause',
          id: competitor.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to update competitor');

      const { competitor: updated } = await response.json();
      onStatusChange?.(updated);
    } catch (error) {
      console.error('Error updating competitor:', error);
      // TODO: Show toast error
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async () => {
    setIsPending(true);
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: competitor.business_id,
          action: 'remove',
          id: competitor.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to remove competitor');

      onRemove?.(competitor.id);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error removing competitor:', error);
      // TODO: Show toast error
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <tr className="border-t border-zinc-200 hover:bg-zinc-50 transition-colors">
        <td className="px-6 py-4">
          <p className="font-medium text-zinc-900">{competitor.name}</p>
          <p className="text-xs text-zinc-500 mt-1">{cleanUrl(competitor.url)}</p>
        </td>
        <td className="px-6 py-4">
          {competitor.is_active ? (
            <Badge tone="success">Active</Badge>
          ) : (
            <Badge tone="neutral">Paused</Badge>
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {/* View external link */}
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                         text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100
                         transition-colors"
              aria-label="Visit competitor site"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* Pause/Resume button */}
            <button
              onClick={handlePauseResume}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                         text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              aria-label={competitor.is_active ? 'Pause' : 'Resume'}
            >
              {competitor.is_active ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            {/* Remove button */}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg
                         text-red-500 hover:text-red-700 hover:bg-red-50
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              aria-label="Remove competitor"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showConfirm}
        title="Remove competitor?"
        description={`Are you sure you want to remove ${competitor.name}? This action cannot be undone.`}
        onConfirm={handleRemove}
        onCancel={() => setShowConfirm(false)}
        isLoading={isPending}
      />
    </>
  );
}
