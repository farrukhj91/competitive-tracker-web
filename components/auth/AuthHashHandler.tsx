'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';

/**
 * Catches Supabase auth callbacks that arrive at the wrong URL.
 *
 * Supabase can send confirmation emails in two flows:
 *
 *   1. PKCE flow:    https://app/auth/callback?code=xxx
 *      → handled by app/auth/callback/route.ts (server-side exchange)
 *
 *   2. Implicit flow: https://app/#access_token=xxx&refresh_token=yyy&type=signup
 *      → hash params, never sent to the server, must be parsed CLIENT-side
 *
 * Some Supabase projects use implicit flow by default depending on email
 * template config. If the user lands on / (landing page) or anywhere else
 * with a hash token, this handler picks it up, sets the session, and
 * redirects to /dashboard. Without it, the user sees the landing page
 * with no clue they're "almost signed in" — exactly the bug we hit.
 *
 * Mount this in the root layout so every page can catch a stray callback.
 */
export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // --- Case A: PKCE flow code arrived at the wrong URL (not /auth/callback) ---
    // Pattern: https://app/?code=xxx (instead of https://app/auth/callback?code=xxx)
    // This happens if the Supabase Site URL is `/` and the email template
    // doesn't append the callback path. We exchange it ourselves here.
    const url = new URL(window.location.href);
    const codeAtWrongUrl =
      url.searchParams.get('code') && !url.pathname.startsWith('/auth/callback');

    if (codeAtWrongUrl) {
      const code = url.searchParams.get('code')!;
      (async () => {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        // Clean the URL regardless
        url.searchParams.delete('code');
        window.history.replaceState(null, '', url.pathname + url.search);
        if (exchangeError) {
          router.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`);
        } else {
          router.replace('/dashboard?welcome=true');
        }
      })();
      return;
    }

    // --- Case B: Implicit flow with hash tokens ---
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return;

    // Parse the URL fragment as if it were a query string
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      // Clean the URL and send the user to login with the error message
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      router.replace(`/login?error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    if (!access_token || !refresh_token) return;

    // Set the session via the SDK so the cookie is written, then clean the
    // URL and route the user to the dashboard.
    (async () => {
      const { error: setError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      // Always strip the hash so refreshing doesn't re-trigger this handler
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (setError) {
        router.replace(`/login?error=${encodeURIComponent(setError.message)}`);
        return;
      }

      // type=signup → first-time verification → show welcome banner
      const welcome = type === 'signup' ? '?welcome=true' : '';
      router.replace(`/dashboard${welcome}`);
    })();
  }, [router]);

  return null;
}
