/**
 * Browser-side database helpers — read businesses, competitors, and reports
 * scoped to the currently logged-in user.
 *
 * NOTE for Session 2: RLS is currently disabled on the Supabase tables
 * (see ../my-tracker/CLAUDE.md). We filter manually by user_email until
 * RLS lands in Session 3. The legacy `user_email` column on `businesses`
 * is the bridge — every business created here gets the auth user's email
 * stamped on it so it shows up in their list.
 */

import { supabase } from './auth';

export interface Business {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  user_email: string | null;
  is_paused?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  business_id: string;
  name: string;
  url: string;
  linkedin_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  business_id: string;
  report_date: string;
  full_report_html: string | null;
  summary_html: string | null;
  sent_at: string | null;
  created_at: string;
}

async function getCurrentEmail(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email ?? null;
}

/**
 * List businesses for the current user.
 * Decorates each row with competitor_count + last_report_date for the dashboard.
 */
export async function listBusinessesForCurrentUser(): Promise<
  Array<Business & { competitor_count: number; last_report_date: string | null }>
> {
  const email = await getCurrentEmail();
  if (!email) return [];

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[listBusinesses] error:', error);
    return [];
  }

  if (!businesses || businesses.length === 0) return [];

  // Fetch competitor counts and last report dates in parallel
  const ids = businesses.map((b) => b.id);

  const [competitorsRes, reportsRes] = await Promise.all([
    supabase
      .from('competitors')
      .select('business_id')
      .in('business_id', ids),
    supabase
      .from('reports')
      .select('business_id, report_date')
      .in('business_id', ids)
      .order('report_date', { ascending: false }),
  ]);

  const competitorCount = new Map<string, number>();
  for (const c of competitorsRes.data ?? []) {
    competitorCount.set(c.business_id, (competitorCount.get(c.business_id) ?? 0) + 1);
  }

  const lastReport = new Map<string, string>();
  for (const r of reportsRes.data ?? []) {
    if (!lastReport.has(r.business_id)) {
      lastReport.set(r.business_id, r.report_date);
    }
  }

  return businesses.map((b) => ({
    ...b,
    competitor_count: competitorCount.get(b.id) ?? 0,
    last_report_date: lastReport.get(b.id) ?? null,
  }));
}

export async function getBusiness(id: string): Promise<Business | null> {
  const email = await getCurrentEmail();
  if (!email) return null;

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('user_email', email)
    .maybeSingle();

  if (error) {
    console.error('[getBusiness] error:', error);
    return null;
  }
  return data;
}

export async function getCompetitorsForBusiness(businessId: string): Promise<Competitor[]> {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  if (error) {
    console.error('[getCompetitors] error:', error);
    return [];
  }
  return data ?? [];
}

export async function getReportsForBusiness(businessId: string, limit = 20): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('business_id', businessId)
    .order('report_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getReports] error:', error);
    return [];
  }
  return data ?? [];
}

export async function getReport(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getReport] error:', error);
    return null;
  }
  return data;
}

export async function createBusiness(input: {
  name: string;
  url?: string;
  description?: string;
}): Promise<Business | null> {
  const email = await getCurrentEmail();
  if (!email) return null;

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: input.name,
      url: input.url || null,
      description: input.description || null,
      user_email: email,
    })
    .select()
    .single();

  if (error) {
    console.error('[createBusiness] error:', error);
    throw new Error(error.message);
  }
  return data;
}
