"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Project, Skill } from "@/lib/types";
import { levelLabel, pad2 } from "@/lib/utils";
import SectionHeading from "../site/SectionHeading";

export default function Skills({ skills, projects }: { skills: Skill[]; projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const groups = useMemo(() => {
    const m = new Map<string, Skill[]>();
    skills.forEach((s) => m.set(s.category, [...(m.get(s.category) ?? []), s]));
    return [...m.entries()];
  }, [skills]);
  const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

  useEffect(() => {
    const el = root.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".sk-group").forEach((g) => {
        const title = g.querySelector(".sk-title");
        const items = g.querySelectorAll(".sk-item");
        const bars = g.querySelectorAll<HTMLElement>(".sk-bar");
        const line = g.querySelector(".sk-line");
        gsap.set(title, { yPercent: 110 });
        gsap.set(items, { opacity: 0, y: 26, clipPath: "inset(0 0 100% 0)" });
        gsap.set(bars, { scaleX: 0 });
        gsap.set(line, { scaleX: 0 });
        ScrollTrigger.create({
          trigger: g,
          start: "top 78%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
            tl.to(line, { scaleX: 1, duration: 1.2 })
              .to(title, { yPercent: 0, duration: 1.1 }, 0.05)
              .to(items, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.9, stagger: 0.05 }, 0.2)
              .to(bars, { scaleX: 1, duration: 1.4, stagger: 0.05, ease: "power3.out" }, 0.45);
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [groups.length]);

  return (
    <section id="skills" ref={root} className="py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="03"
          eyebrow="Skills & stack"
          title={<>The tools I reach for <span className="serif-accent">every day.</span></>}
          intro="Grouped by where they sit in a product. Levels are honest: Advanced means I've shipped real work with it; Familiar means I've built with it and keep learning."
        />

        <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
          {groups.map(([cat, list], gi) => (
            <div key={cat} className="sk-group grid gap-8 md:grid-cols-12">
              <div className="self-start md:sticky md:top-28 md:col-span-4">
                <div className="sk-line h-px origin-left bg-ink" />
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="font-mono text-xs text-muted">{pad2(gi + 1)}</span>
                  <div className="overflow-hidden">
                    <h3 className="sk-title text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.035em]">{cat}</h3>
                  </div>
                </div>
                <p className="mt-3 pl-9 font-mono text-xs text-muted">{pad2(list.length)} skills</p>
              </div>
              <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 md:col-span-8">
                {list.map((s) => (
                  <li key={s.id} className="sk-item group border-b border-line py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-lg font-medium tracking-[-0.01em] text-ink">{s.name}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{levelLabel(s.level)}</span>
                    </div>
                    <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-line">
                      <div className="sk-bar h-full origin-left rounded-full bg-ink transition-colors duration-300 group-hover:bg-accent" style={{ width: `${s.level}%` }} />
                    </div>
                    {s.used_in.length > 0 && (
                      <p className="mt-3 text-xs text-muted">
                        Used in{" "}
                        {s.used_in.map((u, i) => (
                          <span key={u}>
                            <Link href={`/projects/${u}`} className="link-u text-ink-2">{titleOf(u)}</Link>
                            {i < s.used_in.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
