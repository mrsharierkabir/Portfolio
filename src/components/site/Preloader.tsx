"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/** Short intro, once per session. Fires `intro:done` on window when finished. */
export default function Preloader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      setShow(false);
      requestAnimationFrame(() => window.dispatchEvent(new Event("intro:done")));
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("intro-seen", "1");
        document.documentElement.style.overflow = "";
        setShow(false);
      },
    });
    tl.to(counter, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => setN(Math.round(counter.v)) })
      .to(".pl-name span", { yPercent: -110, duration: 0.6, stagger: 0.02, ease: "expo.in" }, "+=0.1")
      .add(() => window.dispatchEvent(new Event("intro:done")), "-=0.1")
      .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.2");
    return () => { tl.kill(); document.documentElement.style.overflow = ""; };
  }, []);

  if (!show) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-6 text-paper md:p-10" style={{ clipPath: "inset(0 0 0% 0)" }} aria-hidden>
      <div className="flex justify-between font-mono text-xs uppercase tracking-[0.08em] text-white/50">
        <span>Portfolio</span><span>Dhaka · GMT+6</span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <div className="pl-name overflow-hidden text-[clamp(2rem,6vw,5rem)] font-semibold leading-none tracking-[-0.04em]">
          {name.split(" ").map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block">{w}</span>
          ))}
        </div>
        <span className="font-mono text-[clamp(2rem,6vw,5rem)] leading-none tabular-nums text-white/90">{String(n).padStart(3, "0")}</span>
      </div>
    </div>
  );
}
