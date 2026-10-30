"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Presence } from "@/lib/types";
import { pad2 } from "@/lib/utils";
import { useLenis } from "../site/SmoothScroll";

const GlobeView = dynamic(() => import("./GlobeView"), { ssr: false });
const ease = [0.16, 1, 0.3, 1] as const;

export default function ReachPresence({ presence, home = "Bangladesh" }: { presence: Presence[]; home?: string }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [revealed, setRevealed] = useState({ polygons: false, arcs: false });
  const [open, setOpen] = useState<string | null>(null);
  const [stats, setStats] = useState({ countries: 0, projects: 0 });
  const [ready, setReady] = useState(false);
  const lenis = useLenis();

  const byCountry = useMemo(() => {
    const m: Record<string, Presence[]> = {};
    presence.forEach((p) => { (m[p.country] ||= []).push(p); });
    return m;
  }, [presence]);
  const counts = useMemo(() => Object.fromEntries(Object.entries(byCountry).map(([k, v]) => [k, v.length])), [byCountry]);
  const countryList = useMemo(() => Object.keys(byCountry).sort((a, b) => byCountry[b].length - byCountry[a].length), [byCountry]);
  const totals = { countries: countryList.length, projects: presence.length };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      progress.current = 1;
      setRevealed({ polygons: true, arcs: true });
      setStats(totals);
      setReady(true);
      return;
    }
    const stageEl = stage.current!;
    const sectionEl = section.current!;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stageEl,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.7}`,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            progress.current = p;
            setRevealed((r) => {
              const next = { polygons: p > 0.28, arcs: p > 0.62 };
              return next.polygons !== r.polygons || next.arcs !== r.arcs ? next : r;
            });
            const k = gsap.utils.clamp(0, 1, (p - 0.62) / 0.3);
            setStats({ countries: Math.round(totals.countries * k), projects: Math.round(totals.projects * k) });
            setReady(p > 0.97);
          },
        },
      });
      tl.fromTo(".rp-intro", { scale: 1, opacity: 1, filter: "blur(0px)" }, { scale: 1.12, opacity: 0, filter: "blur(10px)", duration: 0.3 }, 0.08)
        .fromTo(".rp-point", { opacity: 1, scale: 1 }, { opacity: 0, scale: 3, duration: 0.18 }, 0.12)
        .fromTo(".rp-globe", { scale: 0.06, xPercent: 0, opacity: 0.9 }, { scale: 1, opacity: 1, duration: 0.55, ease: "power2.inOut" }, 0.05)
        .fromTo(".rp-globe-pos", { x: () => -(stageEl.clientWidth >= 1024 ? stageEl.clientWidth * 0.22 : 0) }, { x: 0, duration: 0.4, ease: "power2.inOut" }, 0.35)
        .fromTo(".rp-copy > *", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.25, ease: "power2.out" }, 0.55)
        .to({}, { duration: 0.1 }, 0.9);
    }, sectionEl);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presence.length]);

  const openCountry = (name: string) => {
    setOpen(name);
    // make sure the globe is in view and the entrance is complete
    const st = ScrollTrigger.getAll().find((t) => t.trigger === stage.current);
    if (st && progress.current < 1) lenis?.scrollTo(st.end + 2, { duration: 1 });
  };

  const entries = open ? byCountry[open] ?? [] : [];

  return (
    <section id="reach" ref={section} className="relative bg-card">
      <div ref={stage} className="relative h-[100svh] overflow-hidden">
        {/* soft backdrop */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(55%_55%_at_65%_50%,#F1F2F8,transparent_70%)]" />

        {/* intro title (fades away) */}
        <div className="rp-intro pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          <p className="eyebrow mb-6">02 · Reach & Presence</p>
          <h2 className="display text-[clamp(3rem,9vw,8.5rem)] text-ink">
            Built in Dhaka.<br /><span className="serif-accent">Used worldwide.</span>
          </h2>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.08em] text-muted">Scroll ↓</p>
        </div>

        {/* globe */}
        <div className="rp-globe-pos absolute inset-0 flex items-start justify-center pt-[13svh] lg:items-center lg:justify-end lg:pt-0">
          <div className="rp-globe relative aspect-square w-[min(96vw,54svh)] lg:mr-[2vw] lg:w-[min(56vw,86svh)]" style={{ transformOrigin: "50% 50%" }}>
            <span className="rp-point pointer-events-none absolute left-1/2 top-1/2 z-10 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full bg-accent shadow-[0_0_60px_10px_rgba(47,69,255,.45)]" />
            <GlobeView counts={counts} progress={progress} revealed={revealed} home={home} openCountry={open} onOpen={(n) => (n ? openCountry(n) : setOpen(null))} />
          </div>
        </div>

        {/* copy */}
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-8 lg:inset-y-0 lg:flex lg:items-center lg:pb-0">
          <div className="rp-copy pointer-events-auto max-w-[440px]">
            <p className="eyebrow">02 · Reach & Presence</p>
            <h2 className="h2 mt-5 hidden text-ink lg:block">Where my work <span className="serif-accent">lives.</span></h2>
            <p className="mt-5 hidden text-[1.02rem] leading-relaxed text-ink-2 lg:block">
              Clients and users across {totals.countries} {totals.countries === 1 ? "country" : "countries"}. Hover a highlighted country to see the count — click it for the projects.
            </p>
            <div className="mt-6 flex gap-10 lg:mt-10">
              <div>
                <p className="text-5xl font-semibold tabular-nums tracking-[-0.04em] text-ink md:text-6xl">{pad2(stats.countries)}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Countries</p>
              </div>
              <div>
                <p className="text-5xl font-semibold tabular-nums tracking-[-0.04em] text-ink md:text-6xl">{pad2(stats.projects)}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Projects delivered</p>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2 lg:mt-10" aria-label="Countries">
              {countryList.map((c) => (
                <li key={c}>
                  <button onClick={() => openCountry(c)} className={`chip !h-9 gap-2 !px-4 transition-colors ${open === c ? "!border-ink bg-ink !text-paper" : "bg-card hover:!border-ink"}`}>
                    {c} <span className="opacity-60">{pad2(byCountry[c].length)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={`mt-5 hidden font-mono text-[11px] text-muted transition-opacity duration-700 lg:block ${ready ? "opacity-100" : "opacity-0"}`}>Drag to rotate · click a country</p>
          </div>
        </div>

        {/* country panel */}
        <AnimatePresence>
          {open && (
            <motion.aside
              key={open}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.6, ease }}
              className="absolute inset-x-3 bottom-3 z-30 max-h-[70svh] overflow-auto rounded-2xl border border-line bg-card/95 p-6 shadow-[var(--shadow-lift)] backdrop-blur-xl md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:w-[400px] md:-translate-y-1/2"
              data-lenis-prevent
              aria-label={`Projects in ${open}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{pad2(entries.length)} project{entries.length > 1 ? "s" : ""}</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{open}</h3>
                </div>
                <button onClick={() => setOpen(null)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-ink" aria-label="Close">✕</button>
              </div>
              <ul className="mt-6 divide-y divide-line">
                {entries.map((e, i) => {
                  const href = e.project_slug ? `/projects/${e.project_slug}` : e.url;
                  const inner = (
                    <>
                      <span className="font-mono text-xs text-muted">{pad2(i + 1)}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-ink">{e.title}</span>
                        <span className="mt-1 block text-sm text-muted">{[e.kind, e.tech].filter(Boolean).join(" · ")}</span>
                        {e.description && <span className="mt-2 block text-sm text-ink-2">{e.description}</span>}
                      </span>
                      {href && <span aria-hidden className="text-muted transition-transform group-hover:translate-x-1">→</span>}
                    </>
                  );
                  return (
                    <motion.li key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease }}>
                      {href ? (
                        href.startsWith("/") ? (
                          <Link href={href} className="group flex items-start gap-4 py-4">{inner}</Link>
                        ) : (
                          <a href={href} target="_blank" rel="noreferrer" className="group flex items-start gap-4 py-4">{inner}</a>
                        )
                      ) : (
                        <div className="flex items-start gap-4 py-4">{inner}</div>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
