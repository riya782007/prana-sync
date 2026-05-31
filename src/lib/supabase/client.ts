import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SkinScore } from "@/lib/types";

/**
 * Browser-side Supabase client + typed data helpers.
 *
 * Design: we use the public anon key and rely on Row-Level Security (each table
 * has an `auth.uid() = user_id` policy) so users can only ever read/write their
 * own rows. No service-role key is needed on the client. Every helper is a
 * no-op-safe wrapper: if Supabase is not configured, callers fall back to the
 * keyless demo experience.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let cached: SupabaseClient | null = null;

/** Returns a singleton client, or null when not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return cached;
}

// ---------------------------------------------------------------------------
// Skin Score history
// ---------------------------------------------------------------------------
export interface SkinScoreRow {
  id: string;
  overall: number;
  parameters: { name: string; value: number }[];
  notes: string[];
  created_at: string;
}

/** Persist a Skin Score for the signed-in user. Returns the new row id. */
export async function saveSkinScore(
  userId: string,
  score: SkinScore,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("skin_scores")
    .insert({
      user_id: userId,
      overall: score.overall,
      parameters: score.parameters,
      notes: score.notes,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string } | null)?.id ?? null;
}

/** List the signed-in user's Skin Scores, newest first. */
export async function listSkinScores(limit = 30): Promise<SkinScoreRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("skin_scores")
    .select("id, overall, parameters, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as SkinScoreRow[]) ?? [];
}

// ---------------------------------------------------------------------------
// Inventory (refill tracking)
// ---------------------------------------------------------------------------
export interface InventoryRow {
  id: string;
  name: string;
  pack_size: number;
  per_day: number;
  started_on: string;
  created_at: string;
}

export interface InventoryInput {
  name: string;
  pack_size: number;
  per_day: number;
  started_on: string;
}

export async function addInventory(
  userId: string,
  item: InventoryInput,
): Promise<InventoryRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("inventory")
    .insert({ user_id: userId, ...item })
    .select("id, name, pack_size, per_day, started_on, created_at")
    .single();
  if (error) throw new Error(error.message);
  return (data as InventoryRow) ?? null;
}

export async function listInventory(): Promise<InventoryRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("inventory")
    .select("id, name, pack_size, per_day, started_on, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as InventoryRow[]) ?? [];
}

export async function deleteInventory(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("inventory").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Profile (locality / city for calibration)
// ---------------------------------------------------------------------------
export interface ProfileRow {
  id: string;
  area: string | null;
  city: string | null;
}

export async function upsertProfile(
  userId: string,
  area: string,
  city: string,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("profiles")
    .upsert({ id: userId, area, city }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function getProfile(): Promise<ProfileRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, area, city")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ProfileRow) ?? null;
}
