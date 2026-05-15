'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createBusiness } from '@/lib/db';

export default function NewBusiness() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const business = await createBusiness({
        name: name.trim(),
        url: url.trim() || undefined,
        description: description.trim() || undefined,
      });
      if (!business) throw new Error('Failed to create business.');
      router.push(`/dashboard/businesses/${business.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create business.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-8 py-10 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900
                   transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 mb-1">
          Add a business
        </h1>
        <p className="text-sm text-zinc-600">
          Tell us about your business. We&apos;ll discover competitors and start tracking them daily.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <Input
            label="Business name"
            name="name"
            type="text"
            required
            placeholder="e.g., Acme Inc"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Website"
            name="url"
            type="url"
            placeholder="https://acme.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            hint="Optional but recommended — helps with competitor discovery."
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="What does the business do? Who does it serve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3.5 py-2.5 rounded-lg
                         border border-zinc-300 bg-white text-zinc-900 text-sm
                         placeholder:text-zinc-400
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                         focus:border-indigo-500
                         transition-all duration-200 resize-none"
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              The more context you provide, the better we can find relevant competitors.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-indigo-900">
                Competitor discovery coming next
              </p>
              <p className="text-xs text-indigo-800 mt-0.5">
                In the next session, after you create a business, Claude will research
                8-12 candidate competitors for you to review and select.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} disabled={!name.trim()}>
              Create business
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
