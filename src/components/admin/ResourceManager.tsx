"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { RESOURCES, type Resource } from "@/lib/resources";
import { sb, publishChanges } from "./client";
import { useToast } from "./Toast";
import Drawer from "./Drawer";
import ConfirmDelete from "./ConfirmDelete";
import FieldRenderer, { ProjectOptions } from "./FieldRenderer";

type Row = Record<string, unknown> & { id?: string };

export default function ResourceManager({ resourceKey }: { resourceKey: string }) {
  const res: Resource = RESOURCES[resourceKey];
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [projects, setProjects] = useState<{ slug: string; title: string }[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await sb().from(res.table).select("*").order("sort", { ascending: true }).order("created_at", { ascending: true });
    if (error) { toast(error.message, "error"); setRows([]); return; }
    setRows(data as Row[]);
  }, [res.table, toast]);

  useEffect(() => { load(); }, [load]);
  const [autoNew, setAutoNew] = useState(false);
  useEffect(() => {
    if (rows && !autoNew && new URLSearchParams(window.location.search).get("new") === "1") {
      setAutoNew(true);
      startNew();
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);
  useEffect(() => {
    if (!res.fields.some((f) => f.type === "project" || f.type === "projects")) return;
    sb().from("projects").select("slug,title").order("sort").then(({ data }) => setProjects((data as { slug: string; title: string }[]) ?? []));
  }, [res.fields]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s)) : rows;
  }, [rows, q]);

  const startNew = () => {
    const maxSort = Math.max(0, ...(rows ?? []).map((r) => Number(r.sort) || 0));
    setErrors({});
    setEditing({ ...res.defaults, sort: maxSort + 1 });
  };

  const validate = (r: Row) => {
    const e: Record<string, string> = {};
    res.fields.forEach((f) => {
      const v = r[f.name];
      if (f.required && (v === undefined || v === null || String(v).trim() === "")) e[f.name] = `${f.label} is needed.`;
      if (f.type === "url" && v && !/^https?:\/\//i.test(String(v))) e[f.name] = "Start the link with https://";
    });
    return e;
  };

  const save = async () => {
    if (!editing) return;
    const e = validate(editing);
    setErrors(e);
    if (Object.keys(e).length) { toast("A few fields need attention.", "error"); return; }
    setSaving(true);
    const payload: Row = {};
    res.fields.forEach((f) => {
      let v = editing[f.name];
      if (f.type === "lines" && Array.isArray(v)) v = (v as string[]).map((s) => s.trim()).filter(Boolean);
      if (typeof v === "string" && v.trim() === "" && f.type !== "text" && f.type !== "textarea") v = null;
      payload[f.name] = v ?? (f.type === "tags" || f.type === "lines" || f.type === "images" || f.type === "projects" ? [] : f.type === "toggle" ? false : null);
    });
    const q = editing.id ? sb().from(res.table).update(payload).eq("id", editing.id) : sb().from(res.table).insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) { toast(error.message.includes("duplicate") ? "That slug is already used — pick another." : error.message, "error"); return; }
    toast(`${res.singular[0].toUpperCase()}${res.singular.slice(1)} saved`);
    setEditing(null);
    await load();
    publishChanges();
  };

  const togglePublished = async (r: Row) => {
    const { error } = await sb().from(res.table).update({ published: !r.published }).eq("id", r.id);
    if (error) return toast(error.message, "error");
    setRows((x) => x?.map((y) => (y.id === r.id ? { ...y, published: !r.published } : y)) ?? null);
    publishChanges();
  };

  const move = async (i: number, d: number) => {
    if (!rows) return;
    const a = rows[i], b = rows[i + d];
    if (!a || !b) return;
    const sa = Number(a.sort) || i, sbb = Number(b.sort) || i + d;
    const next = [...rows];
    next[i] = { ...b, sort: sa }; next[i + d] = { ...a, sort: sbb === sa ? sa + d : sbb };
    setRows(next);
    await Promise.all([
      sb().from(res.table).update({ sort: next[i].sort }).eq("id", b.id),
      sb().from(res.table).update({ sort: next[i + d].sort }).eq("id", a.id),
    ]);
    publishChanges();
  };

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await sb().from(res.table).delete().eq("id", toDelete.id);
    if (error) return toast(error.message, "error");
    toast("Deleted");
    setToDelete(null);
    await load();
    publishChanges();
  };

  const title = (r: Row) => String(r[res.titleField] ?? "Untitled");

  return (
    <ProjectOptions.Provider value={projects}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">{res.label}</h1>
          <p className="mt-2 max-w-xl text-ink-2">{res.description}</p>
        </div>
        <div className="flex gap-2">
          <input className="field !min-h-10 w-48" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${res.label}`} />
          <button onClick={startNew} className="btn btn-primary btn-md">+ New {res.singular}</button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-card">
        {rows === null ? (
          <div className="space-y-px">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse bg-paper-2/60" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-start gap-4 p-10">
            <p className="text-lg font-medium">{q ? "Nothing matches that search." : `No ${res.label.toLowerCase()} yet.`}</p>
            {!q && <button onClick={startNew} className="btn btn-primary btn-md">Add your first {res.singular}</button>}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((r, i) => (
              <motion.li key={String(r.id)} layout transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="group flex items-center gap-4 px-4 py-3.5 hover:bg-paper/60">
                {!q && (
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="h-5 w-6 text-xs text-muted hover:text-ink disabled:opacity-20" aria-label={`Move ${title(r)} up`}>▲</button>
                    <button onClick={() => move(i, 1)} disabled={i === filtered.length - 1} className="h-5 w-6 text-xs text-muted hover:text-ink disabled:opacity-20" aria-label={`Move ${title(r)} down`}>▼</button>
                  </div>
                )}
                {typeof r.cover_url === "string" && r.cover_url ? <img src={r.cover_url} alt="" className="h-10 w-14 rounded-md border border-line object-cover" /> : typeof r.accent === "string" ? <span className="h-10 w-10 rounded-md" style={{ background: r.accent }} /> : null}
                <button onClick={() => { setErrors({}); setEditing(r); }} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-medium text-ink">{title(r)}</span>
                  {res.subtitle && <span className="block truncate text-sm text-muted">{res.subtitle(r)}</span>}
                </button>
                {res.publishable && (
                  <button onClick={() => togglePublished(r)} className={`chip !h-7 gap-1.5 ${r.published ? "" : "!text-muted"}`} aria-label={r.published ? `Hide ${title(r)}` : `Show ${title(r)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.published ? "bg-success" : "bg-muted"}`} />{r.published ? "Visible" : "Hidden"}
                  </button>
                )}
                <button onClick={() => { setErrors({}); setEditing(r); }} className="btn btn-secondary btn-md !h-8">Edit</button>
                <button onClick={() => setToDelete(r)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger" aria-label={`Delete ${title(r)}`}><Trash2 size={15} /></button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${res.singular}` : `New ${res.singular}`}
        wide
        footer={<>
          <button onClick={() => setEditing(null)} className="btn btn-secondary btn-md">Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-md min-w-[140px]">{saving ? "Saving…" : `Save ${res.singular}`}</button>
        </>}
      >
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-5 md:grid-cols-2">
            {res.fields.map((f) => (
              <FieldRenderer key={f.name} field={f} value={editing[f.name]} record={editing} error={errors[f.name]}
                onChange={(v) => { setEditing((x) => ({ ...x!, [f.name]: v })); if (errors[f.name]) setErrors((e) => { const n = { ...e }; delete n[f.name]; return n; }); }} />
            ))}
            <button type="submit" className="hidden" />
          </form>
        )}
      </Drawer>

      <ConfirmDelete name={toDelete ? title(toDelete) : null} kind={res.singular} onCancel={() => setToDelete(null)} onConfirm={remove} />
    </ProjectOptions.Provider>
  );
}
