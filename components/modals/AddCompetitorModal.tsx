'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Competitor } from '@/lib/db';

interface AddCompetitorModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (competitor: Competitor) => void;
}

export function AddCompetitorModal({
  businessId,
  isOpen,
  onClose,
  onAdd,
}: AddCompetitorModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          action: 'add',
          name: name.trim(),
          url: url.trim(),
          linkedin_url: linkedinUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add competitor');
      }

      const { competitor } = await response.json();
      onAdd(competitor);
      setName('');
      setUrl('');
      setLinkedinUrl('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Add competitor</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Company name
            </label>
            <Input
              id="name"
              placeholder="e.g., Salesforce"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Website URL
            </label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-700 mb-1.5">
              LinkedIn URL (optional)
            </label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/company/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Error */}
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adding...' : 'Add competitor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
