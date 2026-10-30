"use server";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "./supabase/server";

/** Called by the admin panel after every write so the public site updates immediately. */
export async function revalidateSite(): Promise<{ ok: boolean }> {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
