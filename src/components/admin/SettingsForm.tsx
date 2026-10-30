"use client";
import { useEffect, useState } from "react";
import { SETTINGS_GROUPS } from "@/lib/resources";
import { seedSettings } from "@/lib/seed";
import type { SiteSettings } from "@/lib/types";
import { sb, publishChanges } from "./client";
import { useToast } from "./Toast";
import FieldRenderer from "./FieldRenderer";

export default function SettingsForm() {
  const toast = useToast();
  const [data, setData] = useState<SiteSettings | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sb().from("site_settings").select("data").eq("id", 1).maybeSingle().then(({ data: row, error }) => {
      if (error) toast(error.message, "error");
      setData({ ...seedSettings, ...((row?.data as Partial<SiteSettings>) ?? {}) });
    });
  }, [toast]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const clean = { ...data } as Record<string, unknown>;
    ["bio", "hobbies", "likes", "dislikes", "languages", "marquee"].forEach((k) => {
      clean[k] = ((clean[k] as string[]) ?? []).map((s) => s.trim()).filter(Boolean);
    });
    const { error } = await sb().from("site_settings").upsert({ id: 1, data: clean });
    setSaving(false);
    if (error) return toast(error.message, "error");
    setDirty(false);
    toast("Profile saved — the site is updating");
    publishChanges();
  };

  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-paper-2" />;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Profile & site</h1>
          <p className="mt-2 text-ink-2">Everything about you that appears on the site.</p>
        </div>
      </div>
      <div className="mt-8 space-y-6 pb-28">
        {SETTINGS_GROUPS.map((g) => (
          <section key={g.title} className="rounded-2xl border border-line bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold">{g.title}</h2>
            <p className="mt-1 text-sm text-muted">{g.description}</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {g.fields.map((f) => (
                <FieldRenderer key={f.name} field={f} value={(data as unknown as Record<string, unknown>)[f.name]} record={data as unknown as Record<string, unknown>}
                  onChange={(v) => { setData((d) => ({ ...d!, [f.name]: v })); setDirty(true); }} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-ink py-2 pl-5 pr-2 text-paper shadow-[var(--shadow-lift)] transition-all duration-500 ${dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
        <span className="text-sm">You have unsaved changes</span>
        <button onClick={save} disabled={saving} className="btn btn-md bg-white text-ink">{saving ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}
