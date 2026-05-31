"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UseSupabaseUser {
  /** True when NEXT_PUBLIC_SUPABASE_* are set (accounts feature available). */
  configured: boolean;
  /** Still resolving the initial session. */
  loading: boolean;
  user: User | null;
  /** Send a magic-link / OTP email. */
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

/**
 * Auth state hook. Subscribes to Supabase auth changes and exposes a simple
 * email magic-link sign-in. Safe to call when Supabase is not configured —
 * it simply reports `configured: false` and the UI hides account features.
 */
export function useSupabaseUser(): UseSupabaseUser {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    let active = true;

    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const sb = getSupabase();
      if (!sb) return { error: "Accounts are not configured." };
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
  }, []);

  return { configured, loading, user, signIn, signOut };
}
