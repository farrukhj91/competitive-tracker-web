import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
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

    // Get total competitor count
    const { data: competitors, error: competitorError } = await supabase
      .from('competitors')
      .select('id, name')
      .eq('business_id', id);

    if (competitorError) {
      return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
    }

    const totalCompetitors = competitors?.length ?? 0;
    const competitorIds = (competitors ?? []).map((c) => c.id);

    // crawl_results has competitor_id (not business_id) — filter by competitor_id IN (...)
    // and only consider results from the last 30 min so stale crawls don't pollute progress.
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    let crawlResults: Array<{ id: string; competitor_id: string; status: string }> = [];
    if (competitorIds.length > 0) {
      const { data, error: crawlError } = await supabase
        .from('crawl_results')
        .select('id, competitor_id, status, crawl_timestamp')
        .in('competitor_id', competitorIds)
        .gte('crawl_timestamp', thirtyMinAgo);

      if (crawlError) {
        console.error('[crawl-status] crawl_results query error:', crawlError);
        return NextResponse.json(
          { error: 'Failed to fetch crawl status', details: crawlError.message },
          { status: 500 },
        );
      }
      crawlResults = data ?? [];
    }

    const results = crawlResults;

    // Count by status: look for the most recent crawl (same competitor_id, group by latest)
    // For simplicity, count any result with status="success" or "completed"
    const successCount = results.filter((r) => r.status === 'success' || r.status === 'completed')
      .length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const totalCrawled = successCount + failedCount;

    // Determine overall status
    let overallStatus = 'queued';
    if (totalCrawled > 0) overallStatus = 'crawling';
    if (totalCrawled === totalCompetitors) overallStatus = 'completed';
    if (failedCount > 0 && totalCrawled === totalCompetitors) overallStatus = 'completed_with_errors';

    const progressPercent =
      totalCompetitors > 0 ? Math.round((totalCrawled / totalCompetitors) * 100) : 0;

    // Get competitor name for current message (from the latest/in-progress one)
    let currentCompetitorName = '';
    if (successCount > 0 && successCount < totalCompetitors) {
      // Show next competitor in queue
      const successIds = new Set(results.filter((r) => r.status === 'success').map((r) => r.competitor_id));
      const nextCompetitor = competitors?.find((c) => !successIds.has(c.id));
      currentCompetitorName = nextCompetitor?.name || `Competitor ${successCount + 1}`;
    }

    return NextResponse.json({
      status: overallStatus,
      crawled_competitors: totalCrawled,
      total_competitors: totalCompetitors,
      progress_percent: progressPercent,
      message:
        overallStatus === 'completed'
          ? `✅ Crawl finished. ${successCount} competitors completed.`
          : overallStatus === 'queued'
            ? 'Starting crawl...'
            : `Crawling ${currentCompetitorName} (${totalCrawled}/${totalCompetitors})...`,
    });
  } catch (error) {
    console.error('[GET /api/businesses/[id]/crawl-status]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
