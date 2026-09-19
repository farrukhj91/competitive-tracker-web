import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Quota gate — one entry point for every metered operation.
 *
 * Limits live in the `plan_limits` table, not in this file, so changing one is
 * a row update rather than a deploy.
 *
 * The account is derived from the caller's JWT inside the Postgres function,
 * never passed from here. That matters: an account parameter would let anyone
 * burn someone else's daily allowance.
 *
 * `consume_quota` is atomic (INSERT ... ON CONFLICT DO UPDATE ... WHERE takes a
 * row lock), so two simultaneous requests at the limit cannot both pass.
 */

export type QuotaMetric =
  | 'businesses'
  | 'competitors_per_business'
  | 'manual_crawl';

export interface QuotaResult {
  allowed: boolean;
  used: number;
  quota: number;
}

export async function consumeQuota(
  supabase: SupabaseClient,
  metric: QuotaMetric,
): Promise<QuotaResult> {
  const { data, error } = await supabase.rpc('consume_quota', {
    p_metric: metric,
  });

  if (error) {
    console.error('[quota] consume_quota failed:', metric, error);
    throw new Error('Quota check failed');
  }

  // Postgres RETURNS TABLE surfaces as an array of one row.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error('Quota check returned no result');
  }

  return { allowed: row.allowed, used: row.used, quota: row.quota };
}

/**
 * Give a unit back when a metered operation failed before doing any real work.
 *
 * The crawl trigger depends on a Vercel-held GITHUB_PAT that has expired once
 * already. Without this, every such outage silently eats a user's daily crawl
 * allowance for a failure that was never theirs.
 */
export async function refundQuota(
  supabase: SupabaseClient,
  metric: QuotaMetric,
): Promise<void> {
  const { error } = await supabase.rpc('refund_quota', { p_metric: metric });
  if (error) {
    // Never fail the request over a refund — the caller is already handling an
    // error, and an unrefunded unit is the lesser problem.
    console.error('[quota] refund_quota failed:', metric, error);
  }
}

/** Limits are enforced by database triggers; this maps them to readable copy. */
export function parseQuotaError(message: string): string | null {
  const match = /quota_exceeded:(\w+):(\d+):(\d+)/.exec(message);
  if (!match) return null;

  const [, metric, limit] = match;
  if (metric === 'businesses') {
    return `You can track ${limit} business on this plan. Remove the existing one before adding another.`;
  }
  if (metric === 'competitors') {
    return `You can track ${limit} active competitors per business. Pause one before adding another.`;
  }
  return `Limit of ${limit} reached.`;
}
