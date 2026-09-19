import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/businesses/[id]/competitors/batch
 *
 * Bulk-inserts user-selected competitor candidates from the onboarding
 * wizard into the competitors table for the given business.
 *
 * Body: { competitors: Array<{ name, url, description?, overlap_reason?, confidence? }> }
 * Returns: { inserted: Competitor[] }
 */

interface IncomingCompetitor {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  overlap_reason?: unknown;
  confidence?: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ownership
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, user_email')
      .eq('id', id)
      .eq('user_email', user.email)
      .maybeSingle();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found or access denied' },
        { status: 404 },
      );
    }

    // Parse + validate body
    let body: { competitors?: IncomingCompetitor[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!Array.isArray(body.competitors) || body.competitors.length === 0) {
      return NextResponse.json(
        { error: 'Body must include a non-empty "competitors" array' },
        { status: 400 },
      );
    }

    // Normalize + filter rows. Drop anything missing name or url.
    const rows = body.competitors
      .map((c) => ({
        business_id: id,
        name: typeof c.name === 'string' ? c.name.trim() : '',
        url: typeof c.url === 'string' ? c.url.trim() : '',
        description: typeof c.description === 'string' ? c.description.trim() : null,
        overlap_reason:
          typeof c.overlap_reason === 'string' ? c.overlap_reason.trim() : null,
        confidence_score:
          typeof c.confidence === 'number'
            ? Math.max(0, Math.min(1, c.confidence))
            : null,
        is_active: true,
      }))
      .filter((r) => r.name && r.url);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid competitors to insert (each needs name + url)' },
        { status: 400 },
      );
    }

    // Cap against the plan limit before inserting. The database trigger is the
    // real enforcement, but it fires per row and would fail the whole batch —
    // so read the limit, count what is already active, and insert only what
    // fits. Anything over comes in paused rather than being dropped, so the
    // user keeps the research and chooses which five to run.
    const { data: limitRow } = await supabase
      .from('plan_limits')
      .select('limit_value')
      .eq('tier', 'mvp')
      .eq('metric', 'competitors_per_business')
      .maybeSingle();

    const limit = limitRow?.limit_value ?? 5;

    const { count: activeCount } = await supabase
      .from('competitors')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id)
      .eq('is_active', true);

    const slotsLeft = Math.max(0, limit - (activeCount ?? 0));
    const capped = rows.map((r, i) => ({ ...r, is_active: i < slotsLeft }));
    const pausedCount = capped.length - Math.min(capped.length, slotsLeft);

    const { data: inserted, error: insertError } = await supabase
      .from('competitors')
      .insert(capped)
      .select();

    if (insertError) {
      console.error('[competitors/batch] insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert competitors', details: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      inserted: inserted ?? [],
      active: Math.min(capped.length, slotsLeft),
      paused: pausedCount,
      limit,
    });
  } catch (error) {
    console.error('[POST /api/businesses/[id]/competitors/batch]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
