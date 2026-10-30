"use client";
import { useRef } from "react";
import type { Tool } from "@/lib/types";
import { hostOf, pad2 } from "@/lib/utils";
import SectionHeading from "../site/SectionHeading";
import Reveal from "../site/Reveal";

function ToolCard({ t, i }: { t: Tool; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const ac = t.accent || "#2F45FF";
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const href = t.url || t.repo_url;
  const Tag = href ? "a" : "article";
  return (
    <Tag
      ref={ref as never}
      {...(href ? { href, target: "_blank", rel: "noreferrer", "data-cursor": "Open" } : {})}
      onPointerMove={move}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card p-7 transition duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(280px circle at var(--mx) var(--my), ${ac}14, transparent 70%)` }} />
      <div className="flex items-start justify-between">
        <div className="grid h-14 w-14 place-items-center rounded-xl text-2xl font-semibold text-white" style={{ background: ac }}>
          {t.name.charAt(0)}
        </div>
        <span className="font-mono text-xs text-muted">{pad2(i + 1)}</span>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">{t.name}</h3>
        {t.status && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2">
            <span className={`h-1.5 w-1.5 rounded-full ${/live/i.test(t.status) ? "bg-success" : /beta/i.test(t.status) ? "bg-warn" : "bg-muted"}`} />
            {t.status}
          </span>
        )}
      </div>
      {t.tagline && <p className="mt-2 font-serif text-xl italic text-ink-2">{t.tagline}</p>}
      {t.description && <p className="mt-4 text-[0.96rem] leading-relaxed text-ink-2">{t.description}</p>}
      <div className="mt-6 flex flex-wrap gap-2">{t.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      <div className="mt-auto flex items-center justify-between pt-8 text-sm">
        <span className="text-muted">{href ? hostOf(href) : "Link coming soon"}</span>
        {href && <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>}
      </div>
    </Tag>
  );
}

export default function Tools({ tools }: { tools: Tool[] }) {
  if (!tools.length) return null;
  return (
    <section id="tools" className="border-t border-line bg-paper-2/60 py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="05"
          eyebrow="Tools"
          title={<>Small apps I built <span className="serif-accent">to fix my own problems.</span></>}
          intro="Real products I use every day, built end-to-end — interface, Supabase database, auth and storage."
        />
        <Reveal stagger={0.1} className="mt-16 grid gap-5 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => <ToolCard key={t.id} t={t} i={i} />)}
        </Reveal>
      </div>
    </section>
  );
}
