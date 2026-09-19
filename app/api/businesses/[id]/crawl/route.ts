import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { consumeQuota, refundQuota } from '@/lib/quota';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this business
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

    // Get competitor count for this business
    // Only active competitors — the crawler filters on is_active too
    // (my-tracker src/db.py), so dispatching for a business whose competitors
    // are all paused would burn a run and fetch nothing.
    const { data: competitors, error: competitorError } = await supabase
      .from('competitors')
      .select('id')
      .eq('business_id', id)
      .eq('is_active', true);

    if (competitorError || !competitors || competitors.length === 0) {
      return NextResponse.json(
        { error: 'No active competitors found for this business' },
        { status: 400 },
      );
    }

    // Meter the manual trigger. This is the only user-facing button that
    // spends money on demand, so the gate goes here — before the dispatch, so
    // two rapid clicks cannot both get through, and after the ownership and
    // competitor checks, so a request that was going to 400 anyway costs
    // nothing.
    const quota = await consumeQuota(supabase, 'manual_crawl');
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Daily crawl limit reached (${quota.used}/${quota.quota}). Resets at midnight UTC. Scheduled nightly crawls are unaffected.`,
          quota,
        },
        { status: 429 },
      );
    }

    // Call GitHub Actions workflow_dispatch
    const githubToken = process.env.GITHUB_PAT;
    const githubRepo = process.env.GITHUB_REPO; // Format: owner/repo

    if (!githubToken || !githubRepo) {
      await refundQuota(supabase, 'manual_crawl');
      return NextResponse.json(
        { error: 'GitHub configuration missing' },
        { status: 500 },
      );
    }

    const [owner, repo] = githubRepo.split('/');
    const workflowUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/daily_crawl.yml/dispatches`;

    const workflowResponse = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          business_id: id,
        },
      }),
    });

    if (!workflowResponse.ok) {
      // Log full detail server-side (Vercel function logs) so we can debug
      // without leaking infrastructure info (repo, workflow URL, GitHub error
      // body) to the browser.
      const errorData = await workflowResponse.text();
      console.error(
        '[crawl] GitHub API error:',
        workflowResponse.status,
        errorData,
      );
      // The dispatch never happened, so nothing was spent. Don't charge the
      // user for our expired token.
      await refundQuota(supabase, 'manual_crawl');
      return NextResponse.json(
        { error: 'Failed to trigger crawl workflow' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 'queued',
      message: `Crawl started for ${competitors.length} competitors`,
      business_id: id,
      quota,
    });
  } catch (error) {
    console.error('[POST /api/businesses/[id]/crawl]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
