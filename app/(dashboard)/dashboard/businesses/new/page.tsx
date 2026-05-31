'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  ExternalLink,
  Search,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createBusiness } from '@/lib/db';

type Step = 'info' | 'researching' | 'select' | 'launching';

interface Candidate {
  name: string;
  url: string;
  description: string;
  overlap_reason: string;
  confidence: number;
}

function cleanUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function confidenceTone(score: number): 'high' | 'med' | 'low' {
  if (score >= 0.8) return 'high';
  if (score >= 0.55) return 'med';
  return 'low';
}

export default function NewBusinessWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');

  // Step 1 form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');

  // After step 1
  const [businessId, setBusinessId] = useState<string | null>(null);

  // After step 2
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Cross-cutting
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- Step 1 → create business -------------------- */
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const business = await createBusiness({
        name: name.trim(),
        url: url.trim() || undefined,
        description: description.trim() || undefined,
        industry: industry.trim() || undefined,
      });
      if (!business) throw new Error('Failed to create business.');
      setBusinessId(business.id);
      setStep('researching');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create business.');
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- Step 2 → Claude research -------------------- */
  const researchRan = useRef(false);
  useEffect(() => {
    if (step !== 'researching' || !businessId || researchRan.current) return;
    researchRan.current = true;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/businesses/${businessId}/research`, {
          method: 'POST',
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || 'Research failed');
        const cands: Candidate[] = data.candidates ?? [];
        if (cands.length === 0) {
          setError(
            'No competitors returned. Try a more detailed description and retry.',
          );
          return;
        }
        setCandidates(cands);
        // Default-select the top 8 (or all if fewer)
        const defaultSelected = new Set<number>();
        cands.slice(0, 8).forEach((_, i) => defaultSelected.add(i));
        setSelected(defaultSelected);
        setStep('select');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Research failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, businessId]);

  const retryResearch = () => {
    researchRan.current = false;
    setError(null);
    setStep('researching');
  };

  /* -------------------- Step 3 → bulk insert + trigger crawl -------------------- */
  const handleLaunch = async () => {
    if (!businessId) return;
    setError(null);
    setSubmitting(true);
    setStep('launching');

    try {
      const picks = Array.from(selected).map((i) => candidates[i]);

      // Bulk insert
      const insertRes = await fetch(
        `/api/businesses/${businessId}/competitors/batch`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitors: picks }),
        },
      );
      const insertData = await insertRes.json();
      if (!insertRes.ok) {
        throw new Error(insertData.error || 'Failed to save competitors');
      }

      // Trigger first crawl
      const crawlRes = await fetch(`/api/businesses/${businessId}/crawl`, {
        method: 'POST',
      });
      if (!crawlRes.ok) {
        // Don't block — they can manually trigger from business page
        console.warn('[wizard] crawl trigger failed, user can retry manually');
      }

      // Redirect to business page; CrawlProgressModal will pick up live status
      router.push(`/dashboard/businesses/${businessId}?crawl=started`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStep('select');
      setSubmitting(false);
    }
  };

  const toggleSelected = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="px-6 md:px-8 py-10 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900
                   transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to businesses
      </Link>

      <ProgressIndicator step={step} />

      {step === 'info' && (
        <InfoStep
          name={name}
          url={url}
          description={description}
          industry={industry}
          setName={setName}
          setUrl={setUrl}
          setDescription={setDescription}
          setIndustry={setIndustry}
          onSubmit={handleCreateBusiness}
          submitting={submitting}
          error={error}
        />
      )}

      {step === 'researching' && (
        <ResearchingStep error={error} onRetry={retryResearch} businessName={name} />
      )}

      {step === 'select' && (
        <SelectStep
          candidates={candidates}
          selected={selected}
          toggleSelected={toggleSelected}
          onLaunch={handleLaunch}
          submitting={submitting}
          error={error}
        />
      )}

      {step === 'launching' && <LaunchingStep />}
    </div>
  );
}

/* =================================================================== */
/* Step UI subcomponents                                                */
/* =================================================================== */

function ProgressIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'info', label: 'Business' },
    { key: 'researching', label: 'Research' },
    { key: 'select', label: 'Select' },
    { key: 'launching', label: 'Launch' },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);
  return (
    <div className="mb-8 flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={
                'flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ' +
                (done
                  ? 'bg-indigo-600 text-white'
                  : active
                    ? 'bg-indigo-50 border border-indigo-600 text-indigo-700'
                    : 'bg-zinc-100 text-zinc-500')
              }
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={
                'text-xs font-medium ' +
                (active ? 'text-zinc-900' : done ? 'text-zinc-600' : 'text-zinc-400')
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={
                  'w-8 h-px ' + (done ? 'bg-indigo-600' : 'bg-zinc-200')
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoStep(props: {
  name: string;
  url: string;
  description: string;
  industry: string;
  setName: (v: string) => void;
  setUrl: (v: string) => void;
  setDescription: (v: string) => void;
  setIndustry: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 mb-1">
          Tell us about your business
        </h1>
        <p className="text-sm text-zinc-600">
          The more context you give, the better Claude can identify your real competitors.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={props.onSubmit} className="space-y-5">
          {props.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{props.error}</p>
            </div>
          )}

          <Input
            label="Business name"
            name="name"
            type="text"
            required
            placeholder="e.g., Acme Inc"
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
          />

          <Input
            label="Website"
            name="url"
            type="url"
            placeholder="https://acme.com"
            value={props.url}
            onChange={(e) => props.setUrl(e.target.value)}
            hint="Strongly recommended — gives Claude a real starting point for research."
          />

          <Input
            label="Industry / category"
            name="industry"
            type="text"
            placeholder="e.g., Project management SaaS, GovCon intelligence, Fintech for SMBs"
            value={props.industry}
            onChange={(e) => props.setIndustry(e.target.value)}
            hint="A short label helps narrow the competitor search."
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
              placeholder="What does the business do? Who does it serve? What's the wedge?"
              value={props.description}
              onChange={(e) => props.setDescription(e.target.value)}
              className="block w-full px-3.5 py-2.5 rounded-lg
                         border border-zinc-300 bg-white text-zinc-900 text-sm
                         placeholder:text-zinc-400
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                         focus:border-indigo-500
                         transition-all duration-200 resize-none"
            />
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-indigo-900">
                Next: Claude finds your competitors
              </p>
              <p className="text-xs text-indigo-800 mt-0.5">
                We&apos;ll search the web for 8–12 candidates with confidence scores. You pick which ones to track.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={props.submitting} disabled={!props.name.trim()}>
              Find competitors
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

function ResearchingStep({
  error,
  onRetry,
  businessName,
}: {
  error: string | null;
  onRetry: () => void;
  businessName: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-10 shadow-sm text-center">
      {error ? (
        <>
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
            Research failed
          </h2>
          <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">{error}</p>
          <Button onClick={onRetry}>Try again</Button>
        </>
      ) : (
        <>
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 mb-4">
            <Search className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
            Researching competitors{businessName ? ` for ${businessName}` : ''}…
          </h2>
          <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
            Claude is searching the web and analyzing the market. This usually takes
            20–40 seconds.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Searching…
          </div>
        </>
      )}
    </div>
  );
}

function SelectStep(props: {
  candidates: Candidate[];
  selected: Set<number>;
  toggleSelected: (i: number) => void;
  onLaunch: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const count = props.selected.size;
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 mb-1">
          Review and select competitors
        </h1>
        <p className="text-sm text-zinc-600">
          {props.candidates.length} candidates found. Uncheck any that don&apos;t apply, or
          add more later from the competitors page.
        </p>
      </div>

      {props.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">{props.error}</p>
        </div>
      )}

      <ul className="space-y-3 mb-6">
        {props.candidates.map((c, i) => {
          const isSelected = props.selected.has(i);
          const tone = confidenceTone(c.confidence);
          return (
            <li
              key={`${c.name}-${i}`}
              className={
                'bg-white border rounded-xl p-5 shadow-sm transition-all duration-200 ' +
                (isSelected
                  ? 'border-indigo-300 ring-1 ring-indigo-200'
                  : 'border-zinc-200 hover:border-zinc-300')
              }
            >
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => props.toggleSelected(i)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600
                             focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-zinc-900 truncate">
                        {c.name}
                      </h3>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-zinc-500
                                   hover:text-indigo-600 transition-colors"
                      >
                        {cleanUrl(c.url)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <ConfidenceBadge tone={tone} score={c.confidence} />
                  </div>
                  {c.description && (
                    <p className="text-sm text-zinc-600 leading-relaxed mt-2">
                      {c.description}
                    </p>
                  )}
                  {c.overlap_reason && (
                    <p className="text-xs text-zinc-500 leading-relaxed mt-2 italic">
                      Why: {c.overlap_reason}
                    </p>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-4 flex items-center justify-between gap-4
                      bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm text-zinc-700">
          <span className="font-semibold text-zinc-900 tabular-nums">{count}</span> of{' '}
          {props.candidates.length} selected
        </p>
        <Button
          onClick={props.onLaunch}
          loading={props.submitting}
          disabled={count === 0}
          leftIcon={<Rocket className="h-4 w-4" />}
        >
          Start tracking
        </Button>
      </div>
    </>
  );
}

function LaunchingStep() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-10 shadow-sm text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 mb-4">
        <Rocket className="h-6 w-6 text-indigo-600" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
        Saving competitors and starting your first crawl…
      </h2>
      <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
        Hang tight — we&apos;re redirecting you to your dashboard. Your first report
        will be ready in a few minutes.
      </p>
      <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Working…
      </div>
    </div>
  );
}

function ConfidenceBadge({
  tone,
  score,
}: {
  tone: 'high' | 'med' | 'low';
  score: number;
}) {
  const styles =
    tone === 'high'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'med'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-zinc-50 text-zinc-600 border-zinc-200';
  return (
    <span
      className={
        'inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium tabular-nums flex-shrink-0 ' +
        styles
      }
      title="Confidence score"
    >
      {(score * 100).toFixed(0)}%
    </span>
  );
}
