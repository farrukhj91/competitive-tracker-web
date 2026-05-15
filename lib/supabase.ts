import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Singleton browser-side Supabase client.
 *
 * Uses @supabase/ssr's createBrowserClient which stores the session in
 * cookies (NOT localStorage). This is critical so that:
 *
 * 1. The server-side route handler (/auth/callback) can set a session
 *    cookie via exchangeCodeForSession()
 * 2. The browser client immediately sees that same session via cookies
 *
 * If we used the plain `createClient` from `@supabase/supabase-js`,
 * the client would store sessions in localStorage and never see the
 * cookie set by the callback — breaking email confirmation flow.
 */
let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return browserClient;
}
