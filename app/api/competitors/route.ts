import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, action, name, url, linkedin_url, id: competitor_id } = body;

    if (!business_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, action' },
        { status: 400 },
      );
    }

    // Verify user owns this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, user_email')
      .eq('id', business_id)
      .eq('user_email', user.email)
      .maybeSingle();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found or access denied' },
        { status: 404 },
      );
    }

    if (action === 'add') {
      if (!name || !url) {
        return NextResponse.json(
          { error: 'Missing required fields for add: name, url' },
          { status: 400 },
        );
      }

      const { data: newCompetitor, error: insertError } = await supabase
        .from('competitors')
        .insert({
          business_id,
          name,
          url,
          linkedin_url: linkedin_url || null,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[competitors/add]', insertError);
        return NextResponse.json({ error: 'Failed to add competitor' }, { status: 500 });
      }

      return NextResponse.json({ success: true, competitor: newCompetitor });
    }

    if (action === 'edit') {
      if (!competitor_id) {
        return NextResponse.json(
          { error: 'Missing competitor_id for edit' },
          { status: 400 },
        );
      }

      // Verify competitor belongs to this business
      const { data: existing } = await supabase
        .from('competitors')
        .select('id')
        .eq('id', competitor_id)
        .eq('business_id', business_id)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json(
          { error: 'Competitor not found or access denied' },
          { status: 404 },
        );
      }

      const updates: Record<string, unknown> = {};
      if (name) updates.name = name;
      if (url) updates.url = url;
      if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url || null;

      const { data: updatedCompetitor, error: updateError } = await supabase
        .from('competitors')
        .update(updates)
        .eq('id', competitor_id)
        .select()
        .single();

      if (updateError) {
        console.error('[competitors/edit]', updateError);
        return NextResponse.json({ error: 'Failed to edit competitor' }, { status: 500 });
      }

      return NextResponse.json({ success: true, competitor: updatedCompetitor });
    }

    if (action === 'pause') {
      if (!competitor_id) {
        return NextResponse.json(
          { error: 'Missing competitor_id for pause' },
          { status: 400 },
        );
      }

      // Verify competitor belongs to this business
      const { data: existing } = await supabase
        .from('competitors')
        .select('is_active')
        .eq('id', competitor_id)
        .eq('business_id', business_id)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json(
          { error: 'Competitor not found or access denied' },
          { status: 404 },
        );
      }

      // Toggle is_active
      const newIsActive = !existing.is_active;

      const { data: updatedCompetitor, error: updateError } = await supabase
        .from('competitors')
        .update({ is_active: newIsActive })
        .eq('id', competitor_id)
        .select()
        .single();

      if (updateError) {
        console.error('[competitors/pause]', updateError);
        return NextResponse.json({ error: 'Failed to pause competitor' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        competitor: updatedCompetitor,
        message: newIsActive ? 'Competitor resumed' : 'Competitor paused',
      });
    }

    if (action === 'remove') {
      if (!competitor_id) {
        return NextResponse.json(
          { error: 'Missing competitor_id for remove' },
          { status: 400 },
        );
      }

      // Verify competitor belongs to this business
      const { data: existing } = await supabase
        .from('competitors')
        .select('id')
        .eq('id', competitor_id)
        .eq('business_id', business_id)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json(
          { error: 'Competitor not found or access denied' },
          { status: 404 },
        );
      }

      const { error: deleteError } = await supabase
        .from('competitors')
        .delete()
        .eq('id', competitor_id);

      if (deleteError) {
        console.error('[competitors/remove]', deleteError);
        return NextResponse.json({ error: 'Failed to remove competitor' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Competitor removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[POST /api/competitors]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
