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

    const { data: inserted, error: insertError } = await supabase
      .from('competitors')
      .insert(rows)
      .select();

    if (insertError) {
      console.error('[competitors/batch] insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert competitors', details: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ inserted: inserted ?? [] });
  } catch (error) {
    console.error('[POST /api/businesses/[id]/competitors/batch]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
