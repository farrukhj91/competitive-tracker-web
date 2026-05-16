import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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
    const { data: competitors, error: competitorError } = await supabase
      .from('competitors')
      .select('id')
      .eq('business_id', id);

    if (competitorError || !competitors || competitors.length === 0) {
      return NextResponse.json(
        { error: 'No competitors found for this business' },
        { status: 400 },
      );
    }

    // Call GitHub Actions workflow_dispatch
    const githubToken = process.env.GITHUB_PAT;
    const githubRepo = process.env.GITHUB_REPO; // Format: owner/repo

    if (!githubToken || !githubRepo) {
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
      const errorData = await workflowResponse.text();
      console.error('[crawl] GitHub API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to trigger crawl workflow' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 'queued',
      message: `Crawl started for ${competitors.length} competitors`,
      business_id: id,
    });
  } catch (error) {
    console.error('[POST /api/businesses/[id]/crawl]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
