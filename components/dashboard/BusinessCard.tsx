import Link from 'next/link';
import { ArrowUpRight, Globe, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface BusinessCardData {
  id: string;
  name: string;
  url?: string | null;
  description?: string | null;
  competitor_count: number;
  last_report_date?: string | null;
  is_paused?: boolean;
}

function formatDate(d?: string | null) {
  if (!d) return 'Never';
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

export function BusinessCard({ business }: { business: BusinessCardData }) {
  return (
    <Link
      href={`/dashboard/businesses/${business.id}`}
      className="group block bg-white border border-zinc-200 rounded-xl p-6
                 shadow-sm hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5
                 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg
                          bg-gradient-to-br from-indigo-500 to-indigo-700 text-white
                          font-semibold text-sm shadow-sm flex-shrink-0">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-900 tracking-tight truncate">
              {business.name}
            </h3>
            {cleanUrl(business.url) && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                <Globe className="h-3 w-3 flex-shrink-0" />
                {cleanUrl(business.url)}
              </p>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-colors flex-shrink-0" />
      </div>

      {business.description && (
        <p className="text-sm text-zinc-600 mb-4 line-clamp-2 leading-relaxed">
          {business.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {business.competitor_count} competitor{business.competitor_count === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(business.last_report_date)}
          </span>
        </div>
        {business.is_paused && <Badge tone="warning">Paused</Badge>}
      </div>
    </Link>
  );
}
