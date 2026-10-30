"use client";
import { useCallback, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Mail, Trash2 } from "lucide-react";
import type { Message } from "@/lib/types";
import { sb } from "./client";
import { useToast } from "./Toast";
import Drawer from "./Drawer";
import ConfirmDelete from "./ConfirmDelete";

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function Messages() {
  const toast = useToast();
  const [msgs, setMsgs] = useState<Message[] | null>(null);
  const [view, setView] = useState<"inbox" | "archived">("inbox");
  const [open, setOpen] = useState<Message | null>(null);
  const [del, setDel] = useState<Message | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await sb().from("messages").select("*").order("created_at", { ascending: false });
    if (error) toast(error.message, "error");
    setMsgs((data as Message[]) ?? []);
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const patch = async (m: Message, p: Partial<Message>) => {
    setMsgs((x) => x?.map((y) => (y.id === m.id ? { ...y, ...p } : y)) ?? null);
    const { error } = await sb().from("messages").update(p).eq("id", m.id);
    if (error) toast(error.message, "error");
  };
  const openMsg = (m: Message) => { setOpen(m); if (!m.read) patch(m, { read: true }); };

  const list = (msgs ?? []).filter((m) => (view === "inbox" ? !m.archived : m.archived));
  const unread = (msgs ?? []).filter((m) => !m.read && !m.archived).length;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Messages</h1>
      <p className="mt-2 text-ink-2">Everything sent through the contact form.</p>
      <div className="mt-8 flex gap-2">
        {(["inbox", "archived"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`chip !h-9 !px-4 capitalize ${view === v ? "!border-ink bg-ink !text-paper" : "bg-card"}`}>
            {v}{v === "inbox" && unread ? <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[10px] text-white">{unread}</span> : null}
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
        {msgs === null ? <div className="h-48 animate-pulse bg-paper-2/60" /> : list.length === 0 ? (
          <p className="p-10 text-ink-2">{view === "inbox" ? "No messages yet — they'll appear here the moment someone writes." : "Nothing archived."}</p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((m) => (
              <li key={m.id}>
                <button onClick={() => openMsg(m)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-paper/60">
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-accent"}`} aria-label={m.read ? undefined : "Unread"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className={`truncate ${m.read ? "" : "font-semibold"}`}>{m.name} <span className="font-normal text-muted">· {m.email}</span></span>
                      <span className="shrink-0 font-mono text-xs text-muted">{ago(m.created_at)}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-2">{m.purpose}{m.company ? ` · ${m.company}` : ""}</span>
                    <span className="mt-1 block truncate text-sm text-muted">{m.message}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `From ${open.name}` : ""}
        footer={open && <>
          <button onClick={() => { patch(open, { archived: !open.archived }); toast(open.archived ? "Moved to inbox" : "Archived"); setOpen(null); }} className="btn btn-secondary btn-md">{open.archived ? <><ArchiveRestore size={15} />Unarchive</> : <><Archive size={15} />Archive</>}</button>
          <button onClick={() => { setDel(open); setOpen(null); }} className="btn btn-md text-danger hover:bg-danger/10"><Trash2 size={15} />Delete</button>
          <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.purpose || "your message"}`)}`} className="btn btn-primary btn-md"><Mail size={15} />Reply by email</a>
        </>}>
        {open && (
          <div>
            <dl className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
              <dt className="text-muted">Email</dt><dd><a className="link-u" href={`mailto:${open.email}`}>{open.email}</a></dd>
              {open.purpose && <><dt className="text-muted">About</dt><dd>{open.purpose}</dd></>}
              {open.company && <><dt className="text-muted">Company</dt><dd>{open.company}</dd></>}
              <dt className="text-muted">Received</dt><dd>{new Date(open.created_at).toLocaleString("en-GB")}</dd>
            </dl>
            <p className="mt-8 whitespace-pre-wrap rounded-xl border border-line bg-card p-5 leading-relaxed">{open.message}</p>
          </div>
        )}
      </Drawer>
      <ConfirmDelete name={del ? `message from ${del.name}` : null} kind="message" onCancel={() => setDel(null)} onConfirm={async () => {
        const { error } = await sb().from("messages").delete().eq("id", del!.id);
        if (error) return toast(error.message, "error");
        setMsgs((x) => x?.filter((y) => y.id !== del!.id) ?? null); setDel(null); toast("Deleted");
      }} />
    </div>
  );
}
