'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CrawlStatus {
  status: 'queued' | 'crawling' | 'completed' | 'completed_with_errors' | 'failed';
  crawled_competitors: number;
  total_competitors: number;
  progress_percent: number;
  message: string;
}

interface CrawlProgressModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CrawlProgressModal({ businessId, isOpen, onClose }: CrawlProgressModalProps) {
  const [status, setStatus] = useState<CrawlStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !businessId) return;

    setError(null);
    let pollInterval: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/businesses/${businessId}/crawl-status`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch crawl status');
        }

        const data: CrawlStatus = await response.json();
        setStatus(data);

        // Auto-close when completed
        if (data.status === 'completed' || data.status === 'completed_with_errors') {
          pollInterval && clearInterval(pollInterval);
          // Auto-close after 2 seconds
          setTimeout(() => onClose(), 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(pollStatus, 2000);

    return () => {
      pollInterval && clearInterval(pollInterval);
    };
  }, [isOpen, businessId, onClose]);

  if (!isOpen) return null;

  const isComplete = status?.status === 'completed' || status?.status === 'completed_with_errors';
  const isFailed = status?.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Crawl in progress</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          // Error state
          <div className="flex gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </div>
        ) : status ? (
          // Status content
          <div className="space-y-6">
            {/* Message */}
            <p className="text-sm text-zinc-700">{status.message}</p>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-600">
                  {status.crawled_competitors} / {status.total_competitors} competitors
                </span>
                <span className="text-xs font-semibold text-zinc-900">
                  {status.progress_percent}%
                </span>
              </div>
              <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${status.progress_percent}%` }}
                />
              </div>
            </div>

            {/* Status badge and message */}
            {isComplete && (
              <div className="flex gap-3 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Crawl completed</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {status.status === 'completed_with_errors'
                      ? 'Completed with some errors'
                      : 'All competitors crawled successfully'}
                  </p>
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex gap-3 pt-2">
              {isComplete || isFailed ? (
                <Button onClick={onClose} className="flex-1">
                  Close
                </Button>
              ) : (
                <Button disabled className="flex-1">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Crawling...
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Loading state
          <div className="space-y-4">
            <div className="flex gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <p className="text-sm text-zinc-600">Starting crawl...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
