"use client";
import { useEffect, useRef, type ElementType } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number; // if set, animates direct children in sequence
  start?: string;
};

/** Fade + rise on scroll. Reduced motion → plain fade. */
export default function Reveal({ as: Tag = "div", children, className, delay = 0, y = 28, stagger, start = "top 88%" }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = stagger ? Array.from(el.children) : [el];
    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: reduce ? 0 : y });
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: reduce ? 0.2 : 1.1, delay, stagger: stagger ?? 0, ease: "expo.out" }),
      });
    }, el);
    return () => ctx.revert();
  }, [delay, y, stagger, start]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
