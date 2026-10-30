"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

let client: SupabaseClient | null = null;

/** Browser client (admin panel). Returns null when Supabase isn't configured. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
