"use client";
import { createContext, useContext, useRef, useState } from "react";
import type { Field } from "@/lib/resources";
import { COUNTRY_NAMES } from "@/lib/countries";
import { slugify } from "@/lib/utils";
import { uploadFile } from "./client";
import { useToast } from "./Toast";

export const ProjectOptions = createContext<{ slug: string; title: string }[]>([]);

type Props = { field: Field; value: unknown; onChange: (v: unknown) => void; record: Record<string, unknown>; error?: string };

const asArr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export default function FieldRenderer({ field: f, value, onChange, record, error }: Props) {
  const id = `f-${f.name}`;
  const labelEl = (
    <label htmlFor={id} className="field-label">
      {f.label}{f.required && <span className="text-danger"> *</span>}
    </label>
  );
  const help = f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>;
  const err = error && <p className="mt-1.5 text-sm text-danger">{error}</p>;
  const wrap = (input: React.ReactNode) => <div className={f.half ? "" : "md:col-span-2"}>{labelEl}{input}{err}{help}</div>;
  const str = (value ?? "") as string;

  switch (f.type) {
    case "text":
    case "url":
      return wrap(<input id={id} className="field" type={f.type === "url" ? "url" : "text"} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />);
    case "number":
      return wrap(<input id={id} className="field" type="number" value={(value as number) ?? 0} onChange={(e) => onChange(Number(e.target.value))} />);
    case "date":
      return wrap(<input id={id} className="field" type="datetime-local" value={str ? toLocal(str) : ""} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />);
    case "textarea":
      return wrap(<textarea id={id} className="field min-h-[120px] resize-y" rows={f.name === "description" ? 8 : 3} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />);
    case "select":
      return wrap(
        <select id={id} className="field" value={str} onChange={(e) => onChange(e.target.value)}>
          {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>,
      );
    case "toggle":
      return (
        <div className={`${f.half ? "" : "md:col-span-2"} flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3`}>
          <label htmlFor={id} className="text-sm font-medium text-ink-2">{f.label}</label>
          <button id={id} type="button" role="switch" aria-checked={!!value} onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-ink" : "bg-line"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${value ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      );
    case "slug":
      return wrap(
        <div className="flex gap-2">
          <input id={id} className="field font-mono text-sm" value={str} onChange={(e) => onChange(slugify(e.target.value))} aria-invalid={!!error} />
          <button type="button" className="btn btn-secondary btn-md shrink-0" onClick={() => onChange(slugify(String(record[f.from ?? "title"] ?? "")))}>Generate</button>
        </div>,
      );
    case "color":
      return wrap(
        <div className="flex items-center gap-3">
          <input id={id} type="color" className="h-12 w-14 cursor-pointer rounded-lg border border-line bg-card p-1" value={str || "#2F45FF"} onChange={(e) => onChange(e.target.value)} />
          <input className="field font-mono text-sm" value={str} onChange={(e) => onChange(e.target.value)} aria-label={`${f.label} hex`} />
        </div>,
      );
    case "range":
      return wrap(
        <div className="flex items-center gap-4">
          <input id={id} type="range" min={0} max={100} step={5} className="w-full accent-[var(--color-ink)]" value={(value as number) ?? 70} onChange={(e) => onChange(Number(e.target.value))} />
          <span className="w-12 text-right font-mono text-sm">{(value as number) ?? 70}%</span>
        </div>,
      );
    case "country":
      return wrap(
        <>
          <input id={id} className="field" list={`${id}-list`} value={str} placeholder="Start typing…" onChange={(e) => onChange(e.target.value)} aria-invalid={!!str && !COUNTRY_NAMES.includes(str)} />
          <datalist id={`${id}-list`}>{COUNTRY_NAMES.map((c) => <option key={c} value={c} />)}</datalist>
          {str && !COUNTRY_NAMES.includes(str) && <p className="mt-1.5 text-xs text-warn">Pick a name from the list so it lights up on the globe.</p>}
        </>,
      );
    case "tags":
      return wrap(<TagsInput id={id} value={asArr(value)} onChange={onChange} placeholder={f.placeholder} />);
    case "lines":
      return wrap(
        <textarea id={id} className="field min-h-[110px] resize-y" rows={Math.max(3, asArr(value).length + 1)} value={asArr(value).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />,
      );
    case "pairs":
      return wrap(<PairsInput value={(value as Record<string, string>[]) ?? []} keys={f.pairKeys ?? ["label", "value"]} onChange={onChange} />);
    case "project":
      return wrap(<ProjectSelect id={id} value={str} onChange={onChange} />);
    case "projects":
      return wrap(<ProjectMulti value={asArr(value)} onChange={onChange} />);
    case "image":
    case "file":
      return wrap(<UploadField id={id} value={str} onChange={onChange} folder={f.folder} accept={f.accept ?? "image/*"} image={f.type === "image"} />);
    case "images":
      return wrap(<GalleryField value={asArr(value)} onChange={onChange} folder={f.folder} />);
    default:
      return null;
  }
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function TagsInput({ id, value, onChange, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const t = draft.trim(); if (t && !value.includes(t)) onChange([...value, t]); setDraft(""); };
  return (
    <div className="field flex min-h-12 flex-wrap items-center gap-2 !py-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 py-1 pl-3 pr-1.5 text-sm">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-line hover:text-ink" aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input id={id} className="min-w-[120px] flex-1 bg-transparent outline-none" value={draft} placeholder={placeholder ?? "Add and press Enter"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1)); }}
        onBlur={add} />
    </div>
  );
}

function PairsInput({ value, keys, onChange }: { value: Record<string, string>[]; keys: [string, string]; onChange: (v: Record<string, string>[]) => void }) {
  const [a, b] = keys;
  const set = (i: number, k: string, v: string) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input className="field" placeholder={a} value={row[a] ?? ""} onChange={(e) => set(i, a, e.target.value)} aria-label={`${a} ${i + 1}`} />
          <input className="field" placeholder={b} value={row[b] ?? ""} onChange={(e) => set(i, b, e.target.value)} aria-label={`${b} ${i + 1}`} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="btn btn-secondary btn-md shrink-0" aria-label={`Remove row ${i + 1}`}>✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { [a]: "", [b]: "" }])} className="btn btn-secondary btn-md">+ Add row</button>
    </div>
  );
}

function ProjectSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string | null) => void }) {
  const opts = useContext(ProjectOptions);
  return (
    <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— None —</option>
      {opts.map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
    </select>
  );
}

function ProjectMulti({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const opts = useContext(ProjectOptions);
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const on = value.includes(o.slug);
        return (
          <button key={o.slug} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.slug) : [...value, o.slug])}
            className={`chip !h-9 !px-4 transition ${on ? "!border-ink bg-ink !text-paper" : "bg-card hover:!border-ink"}`}>{o.title}</button>
        );
      })}
      {!opts.length && <p className="text-sm text-muted">Add projects first.</p>}
    </div>
  );
}

function UploadField({ id, value, onChange, folder, accept, image }: { id: string; value: string; onChange: (v: string | null) => void; folder?: string; accept: string; image: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const pick = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast("That file is over 15 MB — try a smaller one.", "error"); return; }
    setBusy(true);
    try { onChange(await uploadFile(file, folder)); toast("Uploaded"); }
    catch (e) { toast(`Upload failed: ${(e as Error).message}`, "error"); }
    finally { setBusy(false); }
  };
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
      className="rounded-xl border border-dashed border-line bg-card p-3"
    >
      {value && image && <img src={value} alt="" className="mb-3 max-h-56 w-full rounded-lg object-contain" />}
      {value && !image && <a href={value} target="_blank" rel="noreferrer" className="mb-3 block truncate rounded-lg bg-paper-2 px-3 py-2 font-mono text-xs text-ink-2">{value}</a>}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={input} id={id} type="file" accept={accept} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" className="btn btn-secondary btn-md" onClick={() => input.current?.click()} disabled={busy}>{busy ? "Uploading…" : value ? "Replace" : "Upload"}</button>
        {value && <button type="button" className="btn btn-md text-danger" onClick={() => onChange(null)}>Remove</button>}
        <input className="field !min-h-10 flex-1 font-mono text-xs" placeholder="…or paste a URL" value={value} onChange={(e) => onChange(e.target.value)} aria-label="File URL" />
      </div>
      <p className="mt-2 text-xs text-muted">Drag and drop works too.</p>
    </div>
  );
}

function GalleryField({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadFile(f, folder));
      onChange([...value, ...urls]);
      toast(`${urls.length} image${urls.length > 1 ? "s" : ""} added`);
    } catch (e) { toast(`Upload failed: ${(e as Error).message}`, "error"); }
    finally { setBusy(false); }
  };
  const move = (i: number, d: number) => { const n = [...value]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  return (
    <div className="rounded-xl border border-dashed border-line bg-card p-3" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((u, i) => (
          <div key={u + i} className="group relative overflow-hidden rounded-lg border border-line">
            <img src={u} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-md bg-ink/80 text-xs text-white disabled:opacity-30" aria-label="Move left">←</button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-md bg-ink/80 text-xs text-white disabled:opacity-30" aria-label="Move right">→</button>
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded-md bg-danger text-xs text-white" aria-label="Remove image">✕</button>
            </div>
          </div>
        ))}
      </div>
      <input ref={input} type="file" multiple accept="image/*" className="sr-only" onChange={(e) => add(e.target.files)} />
      <button type="button" className="btn btn-secondary btn-md mt-3" onClick={() => input.current?.click()} disabled={busy}>{busy ? "Uploading…" : "+ Add images"}</button>
    </div>
  );
}
