"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import type { SiteSettings } from "@/lib/types";
import Desk from "./Desk";
import Roll from "../site/Roll";

export default function Hero({ s, stack }: { s: SiteSettings; stack: string[] }) {
  const root = useRef<HTMLElement>(null);
  const [state, setState] = useState({ lamp: false, monitor: false, laptop: false });

  useEffect(() => {
    const el = root.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(".hero-title", { type: "lines,words", mask: "lines" });
      gsap.set(split.words, { yPercent: 115 });
      gsap.set(".hero-fade", { opacity: 0, y: 18 });
      const go = () => {
        gsap.to(split!.words, { yPercent: 0, duration: 1.4, stagger: 0.045, ease: "expo.out" });
        gsap.to(".hero-fade", { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, delay: 0.35, ease: "expo.out" });
      };
      window.addEventListener("intro:done", go, { once: true });
      const fb = setTimeout(go, 2600);
      // gentle exit as you scroll away
      gsap.to(".hero-copy", {
        yPercent: -18, opacity: 0.2, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      return () => clearTimeout(fb);
    }, el);
    return () => { ctx.revert(); split?.revert(); };
  }, []);

  const hint = !state.lamp ? "Switch on the lamp" : !state.laptop ? "Open the laptop" : !state.monitor ? "Wake the monitor" : "Everything works — try it";

  return (
    <section ref={root} id="top" className="relative overflow-hidden pt-28 md:pt-36" aria-label="Introduction">
      <div className="container-x hero-copy">
        <div className="hero-fade mb-8 flex flex-wrap items-center gap-3">
          {s.available && (
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
              {s.availability}
            </span>
          )}
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{s.location}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="hero-fade mb-4 text-lg text-ink-2">
              {s.name} <span className="text-muted">— {s.role}</span>
            </p>
            <h1 className="hero-title display text-[clamp(2.75rem,7.4vw,7rem)] text-ink">
              {s.headline} <span className="serif-accent">{s.headlineAccent}</span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="hero-fade max-w-md text-[1.05rem] leading-relaxed text-ink-2">{s.pitch}</p>
            <div className="hero-fade mt-7 flex flex-wrap gap-3">
              <a href="#work" className="btn btn-primary"><Roll>View work</Roll><span aria-hidden>↓</span></a>
              {s.resumeUrl && <a href={s.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-secondary"><Roll>Download CV</Roll></a>}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 w-full max-w-[1320px] px-2 md:mt-14 md:px-6">
        <Desk name={s.name} role={s.role} location={s.location} stack={stack} timezone={s.timezone} onStateChange={setState} />
        <div className="pointer-events-none absolute inset-x-0 bottom-[4%] flex justify-center">
          <span className="hero-fade inline-flex items-center gap-2 rounded-full border border-line bg-card/90 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-2 shadow-[var(--shadow-float)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="hidden sm:inline">Interactive desk · </span>{hint}
          </span>
        </div>
      </div>
    </section>
  );
}
