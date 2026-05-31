"use client";

import { useState } from "react";
import type { UseSupabaseUser } from "@/lib/supabase/use-user";

/**
 * Login / account widget. Email magic-link sign in. Renders a quiet "demo
 * mode" hint when Supabase is not configured so the app stays fully usable.
 */
export function AccountPanel({ account }: { account: UseSupabaseUser }) {
  const { configured, loading, user, signIn, signOut } = account;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) {
    return (
      <div className="rounded-xl border border-prana-900 bg-black/20 px-4 py-3 text-xs text-prana-100/50">
        Demo mode — sign-in & saved history are off. Add Supabase keys in your
        deployment to let users create accounts and track Skin Score over time.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-prana-900 bg-black/20 px-4 py-3 text-xs text-prana-100/50">
        Checking session…
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-prana-900 bg-black/20 px-4 py-3">
        <p className="text-sm text-prana-100/80">
          Signed in as <span className="text-prana-100">{user.email}</span>
        </p>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-prana-700 px-3 py-1 text-xs text-prana-100 hover:border-prana-500"
        >
          Sign out
        </button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="rounded-xl border border-prana-900 bg-black/20 px-4 py-4">
      {sent ? (
        <p className="text-sm text-prana-100/80">
          Magic link sent to <span className="text-prana-100">{email}</span> —
          open it on this device to finish signing in.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-sm text-prana-50 outline-none focus:border-prana-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-prana-600 px-5 py-2 text-sm font-medium text-white hover:bg-prana-500 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Sign in to save progress"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
