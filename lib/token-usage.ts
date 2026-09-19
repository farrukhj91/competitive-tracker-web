import type Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cost ledger.
 *
 * Anthropic bills one organisation-level number with no per-tenant breakdown.
 * Without this we cannot compute unit economics, enforce quotas honestly, or
 * tell whether a tenant is profitable. Every SDK call writes one row.
 *
 * Cost is computed in Postgres at write time from the `model_prices` table, so
 * a price change never retroactively rewrites history — and so the rate table
 * lives in one place shared with the Python crawler rather than being
 * duplicated in two languages that will drift.
 *
 * Logging never fails the caller. An unlogged call costs us an accounting row;
 * a throw here would cost the user their result.
 */

export type Operation =
  | 'research'
  | 'teardown'
  | 'triage'
  | 'investigate'
  | 'synthesize'
  | 'report';

interface UsageLike {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export async function logTokenUsage(
  supabase: SupabaseClient,
  args: {
    operation: Operation;
    model: string;
    usage: UsageLike | null | undefined;
    requestId?: string | null;
    entityId?: string | null;
    isBatch?: boolean;
  },
): Promise<void> {
  const u = args.usage;
  if (!u) {
    console.warn('[token-usage] no usage object on response:', args.operation);
    return;
  }

  const { error } = await supabase.rpc('log_token_usage', {
    p_operation: args.operation,
    p_model: args.model,
    p_input_tokens: u.input_tokens ?? 0,
    p_output_tokens: u.output_tokens ?? 0,
    p_cache_read_tokens: u.cache_read_input_tokens ?? 0,
    p_cache_write_tokens: u.cache_creation_input_tokens ?? 0,
    p_entity_id: args.entityId ?? null,
    p_request_id: args.requestId ?? null,
    p_is_batch: args.isBatch ?? false,
  });

  if (error) {
    console.error('[token-usage] failed to log:', args.operation, error);
  }
}

/**
 * Wrapper around messages.create that records what the call cost.
 *
 * Use this rather than calling the SDK directly, so no spend goes unattributed
 * — an unlogged call cannot be reconstructed after the fact.
 *
 * `p_account_email` is deliberately not passed: the Postgres function forces
 * the account from the caller's JWT, so a client cannot bill someone else.
 */
export async function createMessageLogged(
  anthropic: Anthropic,
  supabase: SupabaseClient,
  operation: Operation,
  params: Anthropic.MessageCreateParamsNonStreaming,
  opts: { entityId?: string | null } = {},
): Promise<Anthropic.Message> {
  const response = await anthropic.messages.create(params);

  await logTokenUsage(supabase, {
    operation,
    model: response.model ?? params.model,
    usage: response.usage,
    requestId: response.id,
    entityId: opts.entityId ?? null,
  });

  return response;
}
