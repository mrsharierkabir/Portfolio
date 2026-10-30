"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Project } from "@/lib/types";
import { pad2, hostOf } from "@/lib/utils";
import { useLenis } from "../site/SmoothScroll";
import SectionHeading from "../site/SectionHeading";
import Roll from "../site/Roll";
import { coverDataUrl } from "@/lib/cover";

const ProjectsScene = dynamic(() => import("./ProjectsScene"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProjectsShowcase({ projects }: { projects: Project[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);
  const lenis = useLenis();
  const n = projects.length;

  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    const r = window.matchMedia("(prefers-reduced-motion: reduce)");
    const up = () => { setCompact(m.matches); setReduced(r.matches); };
    up();
    m.addEventListener("change", up);
    return () => m.removeEventListener("change", up);
  }, []);

  useEffect(() => {
    if (reduced || !stage.current || n < 1) return;
    const stageEl = stage.current;
    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: () => `+=${Math.max(1, n - 1) * window.innerHeight * 0.95}`,
        pin: true,
        scrub: 0.6,
        snap: n > 1 ? { snapTo: 1 / (n - 1), duration: { min: 0.35, max: 0.8 }, ease: "power3.inOut", delay: 0.08 } : undefined,
        onUpdate: (self) => {
          const f = self.progress * (n - 1);
          progress.current = f;
          setActive((a) => (Math.round(f) !== a ? Math.round(f) : a));
        },
        onToggle: (self) => setInView(self.isActive),
      });
      // entrance of the stage from below
      gsap.from(".work-stage-inner", { opacity: 0, y: 60, duration: 1.2, scrollTrigger: { trigger: stageEl, start: "top 80%", once: true } });
    }, section.current!);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(stageEl);
    return () => { io.disconnect(); ctx.revert(); st.current = null; };
  }, [n, reduced]);

  const goTo = useCallback((i: number) => {
    const t = st.current;
    if (!t) return;
    const clamped = Math.max(0, Math.min(n - 1, i));
    const y = i >= n ? t.end + 2 : t.start + ((t.end - t.start) * clamped) / Math.max(1, n - 1);
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, [lenis, n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!st.current?.isActive) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  const p = projects[active];
  if (!p) return null;

  /* ---------- reduced-motion fallback ---------- */
  if (reduced) {
    return (
      <section id="work" ref={section} data-theme="dark" className="bg-night py-28 text-white">
        <div className="container-x">
          <SectionHeading index="01" eyebrow="Selected work" title="Things I've built and shipped." dark />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((x, i) => (
              <Link key={x.slug} href={`/projects/${x.slug}`} className="group rounded-2xl border border-night-line bg-night-2 p-5">
                <img src={x.cover_url || coverDataUrl(x)} alt="" className="aspect-[16/10] w-full rounded-xl object-cover" />
                <p className="mt-5 font-mono text-xs text-white/40">{pad2(i + 1)} · {x.category}</p>
                <h3 className="mt-2 text-2xl font-semibold">{x.title}</h3>
                <p className="mt-2 text-white/60">{x.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" ref={section} data-theme="dark" className="relative bg-night text-white">
      <div className="container-x pb-10 pt-28 md:pt-36">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title={<>Things I&apos;ve built <span className="serif-accent text-white/70">and shipped.</span></>}
          intro="Every project here was designed and developed end-to-end by me — from data model to deployment. Scroll, use the arrow keys or the button to move through them."
          dark
        />
      </div>

      <div ref={stage} className="relative h-[100svh] overflow-hidden">
        <div className="work-stage-inner absolute inset-0">
          {/* ambient */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_70%_50%,rgba(47,69,255,.10),transparent_70%)]" />

          {/* 3D */}
          <div className="absolute inset-x-0 top-0 h-[52%] lg:inset-0 lg:h-full">
            <ProjectsScene projects={projects} progress={progress} active={inView} compact={compact} />
          </div>

          {/* info panel */}
          <div className="container-x relative flex h-full flex-col justify-end pb-24 lg:justify-center lg:pb-0">
            <div className="max-w-[460px] lg:max-w-[440px]">
              <div className="mb-6 flex items-center gap-4 font-mono text-xs text-white/45">
                <span className="tabular-nums text-white">{pad2(active + 1)}</span>
                <span className="relative h-px w-24 bg-white/15">
                  <motion.span className="absolute inset-y-0 left-0 bg-white" animate={{ width: `${((active + 1) / n) * 100}%` }} transition={{ duration: 0.6, ease }} />
                </span>
                <span className="tabular-nums">{pad2(n)}</span>
                <span className="ml-2 hidden gap-1.5 sm:flex">
                  {projects.map((x, i) => (
                    <button key={x.slug} onClick={() => goTo(i)} aria-label={`Show ${x.title}`} aria-current={i === active} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/25 hover:bg-white/60"}`} />
                  ))}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={p.slug}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06 } },
                    exit: { opacity: 0, y: -14, filter: "blur(6px)", transition: { duration: 0.25 } },
                  }}
                >
                  {[
                    <p key="c" className="eyebrow !text-white/55">{p.category}</p>,
                    <h3 key="t" className="mt-4 text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">{p.title}</h3>,
                    <p key="s" className="mt-5 text-[1.02rem] leading-relaxed text-white/65">{p.summary}</p>,
                    <div key="st" className="mt-6 flex flex-wrap gap-2">
                      {p.stack.slice(0, 5).map((s) => <span key={s} className="chip !border-white/15 !text-white/75">{s}</span>)}
                    </div>,
                    <div key="l" className="mt-8 flex flex-wrap items-center gap-3">
                      <Link href={`/projects/${p.slug}`} className="btn btn-md bg-white text-ink hover:bg-white/90" data-cursor="Read">
                        <Roll>Case study</Roll><span aria-hidden>→</span>
                      </Link>
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noreferrer" className="btn btn-md border border-white/20 text-white hover:border-white/60">
                          <Roll>{hostOf(p.live_url)}</Roll><span aria-hidden>↗</span>
                        </a>
                      )}
                      {p.repo_url && (
                        <a href={p.repo_url} target="_blank" rel="noreferrer" className="btn btn-md border border-white/20 text-white hover:border-white/60">
                          <Roll>Code</Roll><span aria-hidden>↗</span>
                        </a>
                      )}
                    </div>,
                  ].map((el, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
                        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
                      }}
                    >
                      {el}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* next control */}
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
            <button
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/50 hover:text-white disabled:opacity-25"
              aria-label="Previous project"
            >↑</button>
            <button
              onClick={() => goTo(active + 1 >= n ? n : active + 1)}
              className="group inline-flex h-11 items-center gap-3 rounded-full border border-white/15 px-5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/80 transition hover:border-white/50 hover:text-white"
              aria-label={active + 1 >= n ? "Continue to next section" : "Next project"}
            >
              {active + 1 >= n ? "Continue" : `Next · ${projects[active + 1].title}`}
              <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>↓</motion.span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-x flex justify-center pb-24 pt-10">
        <Link href="/projects" className="btn border border-white/15 text-white hover:border-white/50"><Roll>See all projects</Roll><span aria-hidden>→</span></Link>
      </div>
    </section>
  );
}
