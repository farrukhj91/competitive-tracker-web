'use client';

import { useEffect, useState } from 'react';

interface ReportViewerProps {
  html: string;
}

/**
 * Renders stored HTML reports safely in the dashboard.
 * Uses DOMPurify (browser-only) to strip scripts, event handlers, and
 * any other XSS vectors before injecting into the DOM.
 */
export function ReportViewer({ html }: ReportViewerProps) {
  const [clean, setClean] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import so DOMPurify only loads on the client
    let mounted = true;
    import('dompurify').then((mod) => {
      if (!mounted) return;
      const DOMPurify = mod.default;
      const sanitized = DOMPurify.sanitize(html, {
        ADD_ATTR: ['target'],
      });
      setClean(sanitized);
    });
    return () => {
      mounted = false;
    };
  }, [html]);

  if (clean === null) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-3/4 bg-zinc-200 rounded" />
        <div className="h-4 w-full bg-zinc-200 rounded" />
        <div className="h-4 w-5/6 bg-zinc-200 rounded" />
      </div>
    );
  }

  return (
    <div
      // Tailwind prose-like styling for arbitrary report HTML
      className="report-content text-zinc-800 leading-relaxed"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
