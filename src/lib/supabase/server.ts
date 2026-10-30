import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

/** Cookie-aware client for checking the signed-in admin (dynamic). */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!hasSupabase) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — proxy refreshes sessions instead */
        }
      },
    },
  });
}

/** Cookie-less anon client for public, cacheable reads. */
export function getPublicSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

/** Service-role client (server only, optional). */
export function getServiceSupabase(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

export async function getAdminUser() {
  const sb = await getServerSupabase();
  if (!sb) return { user: null, isAdmin: false };
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, isAdmin: false };
  const { data: row } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { user, isAdmin: Boolean(row) };
}
