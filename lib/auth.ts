import { createClient } from './supabase';

/**
 * Auth helpers — all share the same cookie-based browser client from
 * lib/supabase.ts so that sessions stay in sync with server-set cookies
 * (email confirmation callback, middleware, etc.).
 */
export const supabase = createClient();

export async function signUp(email: string, password: string) {
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}
