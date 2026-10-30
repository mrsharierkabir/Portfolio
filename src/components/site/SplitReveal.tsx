"use client";
import { useEffect, useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

type Props = { as?: ElementType; children: React.ReactNode; className?: string; delay?: number; immediate?: boolean; start?: string };

/** Masked line-by-line reveal for headings. */
export default function SplitReveal({ as: Tag = "h2", children, className, delay = 0, immediate = false, start = "top 85%" }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.set(split.lines, { yPercent: 110 });
      const play = () => gsap.to(split!.lines, { yPercent: 0, duration: 1.2, stagger: 0.08, delay, ease: "expo.out" });
      if (immediate) play();
      else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
    }, el);
    return () => { ctx.revert(); split?.revert(); };
  }, [delay, immediate, start]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
