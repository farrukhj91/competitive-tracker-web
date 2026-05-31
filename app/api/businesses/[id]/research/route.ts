import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/businesses/[id]/research
 *
 * Runs Claude deep research with web_search enabled to identify 8–12
 * candidate competitors for the given business. Does NOT write to the
 * database — the user reviews and selects in the wizard, then we batch
 * insert via /api/businesses/[id]/competitors/batch.
 *
 * Returns: { candidates: Candidate[] }
 */

interface Candidate {
  name: string;
  url: string;
  description: string;
  overlap_reason: string;
  confidence: number;
}

export const maxDuration = 60; // Allow up to 60s for Claude + web_search round-trips

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

    // Ownership check + fetch the business context we'll send to Claude
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, url, description, industry, user_email')
      .eq('id', id)
      .eq('user_email', user.email)
      .maybeSingle();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found or access denied' },
        { status: 404 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a senior strategy consultant at a top-tier firm. A client has just shared their business with you. Your job is to identify their most relevant competitors using web search and your knowledge.

Business: ${business.name}
URL: ${business.url ?? '(not provided)'}
Description: ${business.description ?? '(not provided)'}
Industry: ${business.industry ?? '(not provided)'}

Use web search to find 8–12 direct and adjacent competitors. Include 6–8 direct competitors (high confidence) plus 2–4 adjacent ones (medium confidence) the client might not have considered.

For each competitor, provide:
- name: Full company name
- url: Primary website URL (https://...)
- description: 2–3 sentence factual description of what they do
- overlap_reason: 1–2 sentences on why they compete with ${business.name}
- confidence: 0.0 to 1.0 — how directly they compete

Return ONLY a valid JSON array, no prose before or after, no markdown code fences. Sort by confidence descending. Schema:

[
  {
    "name": "...",
    "url": "https://...",
    "description": "...",
    "overlap_reason": "...",
    "confidence": 0.95
  }
]`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    });

    // Concatenate all `text` content blocks. The web_search tool runs
    // server-side, so the response also contains server_tool_use and
    // web_search_tool_result blocks — we only need the final text.
    const textParts: string[] = [];
    for (const block of response.content) {
      if (block.type === 'text') {
        textParts.push(block.text);
      }
    }
    const text = textParts.join('\n').trim();

    // Extract the JSON array. Claude usually returns clean JSON when asked,
    // but defensively strip code fences / surrounding prose if present.
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[research] No JSON array in Claude response:', text.slice(0, 500));
      return NextResponse.json(
        { error: 'Claude did not return a parseable competitor list' },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('[research] JSON parse error:', err, jsonMatch[0].slice(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse competitor list from Claude' },
        { status: 502 },
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'Claude returned unexpected shape (not an array)' },
        { status: 502 },
      );
    }

    // Validate + normalize each candidate
    const candidates: Candidate[] = parsed
      .filter(
        (c): c is Record<string, unknown> =>
          typeof c === 'object' && c !== null && typeof (c as Record<string, unknown>).name === 'string',
      )
      .map((c) => ({
        name: String(c.name ?? '').trim(),
        url: String(c.url ?? '').trim(),
        description: String(c.description ?? '').trim(),
        overlap_reason: String(c.overlap_reason ?? '').trim(),
        confidence:
          typeof c.confidence === 'number'
            ? Math.max(0, Math.min(1, c.confidence))
            : 0.5,
      }))
      .filter((c) => c.name && c.url);

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('[POST /api/businesses/[id]/research]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
