"use client";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/actions";
import { slugify } from "@/lib/utils";

export const sb = () => {
  const c = getBrowserSupabase();
  if (!c) throw new Error("Supabase isn't configured. Add the env vars from README.md.");
  return c;
};

export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
  const path = `${folder}/${Date.now()}-${base}${ext ? `.${ext.toLowerCase()}` : ""}`;
  const { error } = await sb().storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return sb().storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Re-renders the public site after a change. Never throws. */
export async function publishChanges() {
  try { await revalidateSite(); } catch { /* ignore */ }
}
