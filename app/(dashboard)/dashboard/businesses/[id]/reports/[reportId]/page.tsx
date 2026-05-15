'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportViewer } from '@/components/dashboard/ReportViewer';
import { getBusiness, getReport, type Business, type Report } from '@/lib/db';

function formatDate(d?: string | null) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ReportPage() {
  const params = useParams<{ id: string; reportId: string }>();
  const businessId = params?.id;
  const reportId = params?.reportId;

  const [business, setBusiness] = useState<Business | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'full' | 'summary'>('full');

  useEffect(() => {
    if (!businessId || !reportId) return;
    let mounted = true;
    Promise.all([getBusiness(businessId), getReport(reportId)]).then(([b, r]) => {
      if (!mounted) return;
      setBusiness(b);
      setReport(r);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [businessId, reportId]);

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-10 max-w-5xl mx-auto">
        <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse mb-6" />
        <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse mb-8" />
        <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-3">
          <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-zinc-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="px-6 md:px-8 py-10 max-w-5xl mx-auto">
        <EmptyState
          icon={FileText}
          title="Report not found"
          description="This report may have been deleted or is no longer available."
          action={
            <Link href={businessId ? `/dashboard/businesses/${businessId}` : '/dashboard'}>
              <Button variant="secondary">Back</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const html =
    activeView === 'full'
      ? report.full_report_html ?? report.summary_html ?? '<p>Empty report.</p>'
      : report.summary_html ?? report.full_report_html ?? '<p>Empty report.</p>';

  return (
    <div className="px-6 md:px-8 py-10 max-w-5xl mx-auto">
      <Link
        href={businessId ? `/dashboard/businesses/${businessId}` : '/dashboard'}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900
                   transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {business?.name || 'business'}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
            Report — {formatDate(report.report_date)}
          </h1>
          <p className="text-sm text-zinc-600 mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {business?.name}
            {report.sent_at && (
              <>
                <span>·</span>
                <span>Sent {formatDate(report.sent_at)}</span>
              </>
            )}
          </p>
        </div>

        {report.full_report_html && report.summary_html && (
          <div className="inline-flex p-1 bg-zinc-100 rounded-lg" role="tablist">
            <button
              role="tab"
              aria-selected={activeView === 'full'}
              onClick={() => setActiveView('full')}
              className={
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ' +
                (activeView === 'full'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900')
              }
            >
              Full report
            </button>
            <button
              role="tab"
              aria-selected={activeView === 'summary'}
              onClick={() => setActiveView('summary')}
              className={
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ' +
                (activeView === 'summary'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900')
              }
            >
              Summary
            </button>
          </div>
        )}
      </div>

      {/* Report body */}
      <article className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 md:p-10">
        <ReportViewer html={html} />
      </article>
    </div>
  );
}
