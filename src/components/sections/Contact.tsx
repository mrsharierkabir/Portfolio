"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteSettings } from "@/lib/types";
import SectionHeading from "../site/SectionHeading";
import Reveal from "../site/Reveal";
import Roll from "../site/Roll";

const PURPOSES = ["Hiring — full-time", "Hiring — internship", "Freelance project", "Collaboration", "Just saying hi"];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(f: { name: string; email: string; message: string }): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Add your name so I know who to reply to.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "This email looks incomplete — check for a typo.";
  if (f.message.trim().length < 10) e.message = "A sentence or two helps me reply properly.";
  return e;
}

export default function Contact({ s }: { s: SiteSettings }) {
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const [form, setForm] = useState({ name: "", email: "", purpose: PURPOSES[0], company: "", message: "", website: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const errors = validate(form);
  const show = (k: keyof Errors) => (touched[k] ? errors[k] : undefined);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, elapsed: Date.now() - started.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong on my side.");
      setStatus("sent");
    } catch (err) {
      setServerMsg((err as Error).message);
      setStatus("error");
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(s.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <section id="contact" className="border-t border-line py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="07" eyebrow="Contact" title={<>Let&apos;s build <span className="serif-accent">something good.</span></>} intro={s.contactIntro} />

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
          <Reveal stagger={0.07} className="space-y-3 lg:col-span-4">
            <button onClick={copy} className="group flex w-full items-center justify-between rounded-2xl border border-line bg-card p-5 text-left transition hover:border-ink/40" data-cursor={copied ? "Copied" : "Copy"}>
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Email</span>
                <span className="mt-1.5 block font-medium text-ink">{s.email}</span>
              </span>
              <span className="font-mono text-xs text-muted">{copied ? "Copied ✓" : "Copy"}</span>
            </button>
            {s.showPhone && s.phone && (
              <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`} className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 transition hover:border-ink/40">
                <span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Phone / WhatsApp</span>
                  <span className="mt-1.5 block font-medium text-ink">{s.phone}</span>
                </span>
                <span aria-hidden className="text-muted">↗</span>
              </a>
            )}
            <div className="grid grid-cols-2 gap-3">
              {s.socials.map((x) => (
                <a key={x.url} href={x.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 transition hover:border-ink/40">
                  <span className="font-medium text-ink">{x.label}</span><span aria-hidden className="text-muted">↗</span>
                </a>
              ))}
            </div>
            <div className="rounded-2xl border border-line bg-card p-5">
              <span className="block font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Based in</span>
              <span className="mt-1.5 block font-medium text-ink">{s.location} · GMT+6</span>
              <span className="mt-1 block text-sm text-muted">Open to remote and on-site roles.</span>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7 lg:col-start-6">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 md:p-10">
              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex min-h-[420px] flex-col items-start justify-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-ink text-xl text-paper">✓</motion.div>
                    <h3 className="mt-8 text-3xl font-semibold tracking-[-0.03em]">Message received.</h3>
                    <p className="mt-3 max-w-md text-ink-2">Thanks, {form.name.split(" ")[0]}. I&apos;ll reply to <span className="text-ink">{form.email}</span> within a day.</p>
                    <button onClick={() => { setStatus("idle"); setForm((f) => ({ ...f, message: "" })); setTouched({}); }} className="btn btn-secondary mt-8"><Roll>Send another</Roll></button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -10 }} className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="field-label">Your name</label>
                      <input id="c-name" className="field" value={form.name} onChange={set("name")} onBlur={blur("name")} autoComplete="name" aria-invalid={!!show("name")} aria-describedby="c-name-e" />
                      {show("name") && <p id="c-name-e" className="mt-2 text-sm text-danger">{show("name")}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-email" className="field-label">Email</label>
                      <input id="c-email" type="email" className="field" value={form.email} onChange={set("email")} onBlur={blur("email")} autoComplete="email" placeholder="you@company.com" aria-invalid={!!show("email")} aria-describedby="c-email-e" />
                      {show("email") && <p id="c-email-e" className="mt-2 text-sm text-danger">{show("email")}</p>}
                    </div>
                    <div>
                      <label htmlFor="c-purpose" className="field-label">What&apos;s this about?</label>
                      <select id="c-purpose" className="field appearance-none bg-[length:12px] bg-[right_16px_center] bg-no-repeat" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%23111' fill='none' stroke-width='1.5'/></svg>\")" }} value={form.purpose} onChange={set("purpose")}>
                        {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="c-company" className="field-label">Company <span className="font-normal text-muted">(optional)</span></label>
                      <input id="c-company" className="field" value={form.company} onChange={set("company")} autoComplete="organization" />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="c-msg" className="field-label">Message</label>
                      <textarea id="c-msg" rows={6} className="field resize-y" value={form.message} onChange={set("message")} onBlur={blur("message")} aria-invalid={!!show("message")} aria-describedby="c-msg-e" placeholder="A little about the role or project, timeline, and how to reach you." />
                      {show("message") && <p id="c-msg-e" className="mt-2 text-sm text-danger">{show("message")}</p>}
                    </div>
                    {/* honeypot */}
                    <div aria-hidden className="absolute -left-[9999px]">
                      <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
                    </div>
                    <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-muted" role="status">
                        {status === "error" ? <span className="text-danger">{serverMsg} You can also email me directly.</span> : "I read every message myself."}
                      </p>
                      <button type="submit" disabled={status === "sending"} className="btn btn-primary min-w-[180px] disabled:opacity-70">
                        {status === "sending" ? <span className="flex items-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />Sending…</span> : <><Roll>Send message</Roll><span aria-hidden>→</span></>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
