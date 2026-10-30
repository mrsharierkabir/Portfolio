"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/** Ink dot + ring. Elements with data-cursor="Label" grow the ring and show the label. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    let current: Element | null = null;

    const move = (e: PointerEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button, [role='button'], input, textarea, select, label");
      if (t === current) return;
      current = t;
      const text = t?.getAttribute("data-cursor") ?? "";
      const isText = t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      setLabel(text);
      gsap.to(ring.current, {
        scale: text ? 2.6 : t && !isText ? 1.6 : 1,
        opacity: isText ? 0 : 1,
        backgroundColor: text ? "rgba(17,17,17,0.92)" : "rgba(17,17,17,0)",
        borderColor: text ? "rgba(17,17,17,0)" : "rgba(17,17,17,0.35)",
        duration: 0.4, ease: "expo.out",
      });
      gsap.to(dot.current, { scale: t ? 0 : 1, duration: 0.25 });
    };
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });
    const down = () => gsap.to(ring.current, { scale: "*=0.85", duration: 0.15 });
    const up = () => gsap.to(ring.current, { scale: label ? 2.6 : 1, duration: 0.3 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] mix-blend-normal">
      <div ref={ring} className="fixed left-0 top-0 -ml-[18px] -mt-[18px] grid h-9 w-9 place-items-center rounded-full border border-ink/35">
        <span className="whitespace-nowrap font-mono text-[4.2px] font-medium uppercase tracking-[0.08em] text-paper">{label}</span>
      </div>
      <div ref={dot} className="fixed left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-ink" />
    </div>
  );
}
