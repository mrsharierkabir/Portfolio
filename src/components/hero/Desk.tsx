"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useClock } from "@/hooks/useClock";
import "./desk.css";

/* ------------------------------------------------------------------
   Sharier's desk — a 2D landscape illustration modelled on the real
   setup: black-top desk with walnut side shelf, mesh chair with
   headrest, black riser with oak front, monitor, PC tower, laptop,
   keyboard, mouse, lamp, books, bottle and coffee.
   ------------------------------------------------------------------ */

type Props = {
  name: string;
  role: string;
  location: string;
  stack: string[];
  timezone: string;
  onStateChange?: (s: { lamp: boolean; monitor: boolean; laptop: boolean }) => void;
  /** "login" skips the intro, uses a dusk palette and lets the parent drive the devices. */
  variant?: "hero" | "login";
  forced?: { lamp?: boolean; monitor?: boolean; laptop?: boolean };
  codeOverride?: [string, string][][];
};

const DESK_X = 160;              // desk group offset inside the scene
const PIVOT = { x: 160, y: 215 }; // lamp shade pivot (desk-local)
const DESK_Y = 405;               // desk surface (for light pool)
const BASE_ANGLE = -30;

type Tok = [string, string];
const C = { kw: "#C792EA", vr: "#82AAFF", pr: "#E6E6E6", st: "#C3E88D", bo: "#F78C6C", pu: "#89DDFF", cm: "#5C6370" };

export default function Desk({ name, role, location, stack, timezone, onStateChange, variant = "hero", forced, codeOverride }: Props) {
  const login = variant === "login";
  const svg = useRef<SVGSVGElement>(null);
  const wall = useRef<SVGGElement>(null);
  const deskLayer = useRef<SVGGElement>(null);
  const chairLayer = useRef<SVGGElement>(null);
  const shade = useRef<SVGGElement>(null);
  const pool = useRef<SVGEllipseElement>(null);
  const steam = useRef<SVGGElement>(null);
  const lid = useRef<SVGGElement>(null);
  const lightGroup = useRef<SVGGElement>(null);
  const screenOn = useRef<SVGGElement>(null);

  const [lamp, setLamp] = useState(false);
  const [monitor, setMonitor] = useState(false);
  const [laptop, setLaptop] = useState(false);
  const [typed, setTyped] = useState(0);
  const clock = useClock(timezone);

  const code: Tok[][] = useMemo(() => {
    if (codeOverride) return codeOverride as Tok[][];
    const first = name.split(" ").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "dev";
    const st = stack.slice(0, 3);
    const arr: Tok[] = [["  stack", C.pr], [": [", C.pu]];
    st.forEach((s, i) => { arr.push([`"${s}"`, C.st]); if (i < st.length - 1) arr.push([", ", C.pu]); });
    arr.push(["],", C.pu]);
    return [
      [["const ", C.kw], [first, C.vr], [" = {", C.pu]],
      [["  name", C.pr], [": ", C.pu], [`"${name}"`, C.st], [",", C.pu]],
      [["  role", C.pr], [": ", C.pu], [`"${role}"`, C.st], [",", C.pu]],
      arr,
      [["  based", C.pr], [": ", C.pu], [`"${location.split(",")[0]}, BD"`, C.st], [",", C.pu]],
      [["  available", C.pr], [": ", C.pu], ["true", C.bo], [",", C.pu]],
      [["};", C.pu]],
      [["// scroll for the work ↓", C.cm]],
    ];
  }, [name, role, location, stack, codeOverride]);
  const totalChars = useMemo(() => code.reduce((n, l) => n + l.reduce((m, t) => m + t[0].length, 0) + 1, 0), [code]);

  useEffect(() => { onStateChange?.({ lamp, monitor, laptop }); }, [lamp, monitor, laptop, onStateChange]);
  useEffect(() => {
    if (!forced) return;
    if (forced.lamp !== undefined) setLamp(forced.lamp);
    if (forced.monitor !== undefined) setMonitor(forced.monitor);
    if (forced.laptop !== undefined) setLaptop(forced.laptop);
  }, [forced?.lamp, forced?.monitor, forced?.laptop]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- typing on the monitor ---------- */
  useEffect(() => {
    if (!monitor) { setTyped(0); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(totalChars); return; }
    let i = 0;
    const t = setInterval(() => { i += 2; setTyped(Math.min(i, totalChars)); if (i >= totalChars) clearInterval(t); }, 28);
    return () => clearInterval(t);
  }, [monitor, totalChars]);

  /* ---------- lamp on/off ---------- */
  useEffect(() => {
    const g = lightGroup.current;
    if (!g) return;
    gsap.to(g, { opacity: lamp ? 1 : 0, duration: lamp ? 0.05 : 0.45, ease: "power2.out" });
    if (lamp) { g.classList.remove("flicker"); void (g as unknown as HTMLElement).getBoundingClientRect(); g.classList.add("flicker"); }
  }, [lamp]);

  /* ---------- monitor on/off ---------- */
  useEffect(() => {
    if (!screenOn.current) return;
    gsap.fromTo(screenOn.current, { opacity: monitor ? 0 : 1, scaleY: monitor ? 0.02 : 1 }, {
      opacity: monitor ? 1 : 0, scaleY: 1, duration: monitor ? 0.55 : 0.3, ease: "expo.out", svgOrigin: `${DESK_X + 480} 214`,
    });
  }, [monitor]);

  /* ---------- laptop lid ---------- */
  useEffect(() => {
    if (!lid.current) return;
    gsap.to(lid.current, { scaleY: laptop ? 1 : 0.0, opacity: laptop ? 1 : 0, duration: laptop ? 0.9 : 0.6, ease: laptop ? "expo.out" : "expo.inOut", svgOrigin: `${DESK_X + 192} 399` });
  }, [laptop]);

  /* ---------- intro choreography ---------- */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (login) return;
    if (reduce) { setLamp(true); setMonitor(true); return; }
    const root = svg.current!;
    const ctx = gsap.context(() => {
      gsap.set(".d-wall", { opacity: 0, scale: 0.97, svgOrigin: "640 400" });
      gsap.set(".d-desk", { opacity: 0, y: 26 });
      gsap.set(".d-item", { opacity: 0, y: -16 });
      gsap.set(".d-chair", { opacity: 0, x: -30 });
    }, root);
    let fired = false;
    const go = () => {
      if (fired) return; fired = true;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(root.querySelectorAll(".d-wall"), { opacity: 1, scale: 1, duration: 1.4 })
        .to(root.querySelectorAll(".d-desk"), { opacity: 1, y: 0, duration: 1.2 }, 0.15)
        .to(root.querySelectorAll(".d-item"), { opacity: 1, y: 0, duration: 1, stagger: 0.06 }, 0.45)
        .to(root.querySelectorAll(".d-chair"), { opacity: 1, x: 0, duration: 1.3 }, 0.5)
        .add(() => setLamp(true), 1.35)
        .add(() => setMonitor(true), 1.9);
    };
    window.addEventListener("intro:done", go);
    const fallback = setTimeout(go, 2600);
    return () => { window.removeEventListener("intro:done", go); clearTimeout(fallback); ctx.revert(); };
  }, [login]);

  /* ---------- cursor: parallax, lamp tracking, steam drift ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = svg.current!;
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let angleT = BASE_ANGLE, angle = BASE_ANGLE, raf = 0, visible = true;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      // lamp aims toward the cursor (in scene units)
      const sx = ((e.clientX - r.left) / r.width) * 1280 - DESK_X;
      const sy = ((e.clientY - r.top) / r.height) * 760;
      const dx = sx - PIVOT.x, dy = Math.max(60, sy - PIVOT.y);
      const deg = -Math.atan2(dx, dy) * (180 / Math.PI);
      angleT = Math.max(-52, Math.min(-8, BASE_ANGLE + (deg - BASE_ANGLE) * 0.35));
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      angle += (angleT - angle) * 0.08;
      wall.current?.setAttribute("transform", `translate(${cur.x * -4} ${cur.y * -3})`);
      deskLayer.current?.setAttribute("transform", `translate(${cur.x * 6} ${cur.y * 3})`);
      chairLayer.current?.setAttribute("transform", `translate(${cur.x * 14} ${cur.y * 6})`);
      shade.current?.setAttribute("transform", `translate(${PIVOT.x} ${PIVOT.y}) rotate(${angle})`);
      const rad = (-angle * Math.PI) / 180;
      pool.current?.setAttribute("cx", String(PIVOT.x + Math.tan(rad) * (DESK_Y - PIVOT.y)));
      steam.current?.setAttribute("transform", `skewX(${-cur.x * 10})`);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("pointermove", onMove); };
  }, []);

  const press = useCallback((fn: () => void) => ({
    onClick: fn,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } },
  }), []);

  /* ---------- render helpers ---------- */
  let remaining = typed;
  const codeLines = code.map((line) => {
    const spans: React.ReactNode[] = [];
    for (let ti = 0; ti < line.length; ti++) {
      if (remaining <= 0) break;
      const [txt, col] = line[ti];
      const part = txt.slice(0, remaining);
      remaining -= part.length;
      spans.push(<tspan key={ti} fill={col}>{part}</tspan>);
    }
    remaining -= 1;
    return spans;
  });
  const caretLine = Math.min(code.length - 1, codeLines.findIndex((_, i) => {
    let n = 0; for (let k = 0; k <= i; k++) n += code[k].reduce((m, t) => m + t[0].length, 0) + 1; return typed < n;
  }) === -1 ? code.length - 1 : codeLines.findIndex((_, i) => {
    let n = 0; for (let k = 0; k <= i; k++) n += code[k].reduce((m, t) => m + t[0].length, 0) + 1; return typed < n;
  }));

  return (
    <svg ref={svg} viewBox="0 0 1280 760" className="desk-svg select-none" role="group" aria-label="Interactive illustration of Sharier's desk">
      <defs>
        <pattern id="walnutGrain" width="120" height="14" patternUnits="userSpaceOnUse">
          <rect width="120" height="14" fill="#7B4A2D" />
          <path d="M0 3 C30 1 60 5 120 3 M0 9 C40 7 80 12 120 9" stroke="#6A3D23" strokeWidth="1" fill="none" opacity=".7" />
          <path d="M0 6 C50 5 70 8 120 6" stroke="#8C5634" strokeWidth=".8" fill="none" opacity=".6" />
        </pattern>
        <pattern id="oakGrain" width="90" height="10" patternUnits="userSpaceOnUse">
          <rect width="90" height="10" fill="#B8875B" />
          <path d="M0 2 C25 1 55 3 90 2 M0 7 C30 6 60 8.5 90 7" stroke="#A47449" strokeWidth=".8" fill="none" opacity=".75" />
        </pattern>
        <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="4" height="4" fill="#18181B" />
          <line x1="0" y1="0" x2="0" y2="4" stroke="#2A2A2E" strokeWidth="1.1" />
        </pattern>
        <pattern id="pcMesh" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="#141416" fillOpacity=".86" />
          <circle cx="2.5" cy="2.5" r="1.25" fill="#000" fillOpacity=".55" />
        </pattern>
        <pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#C4A57A" />
          <path d="M0 2h8M0 6h8" stroke="#A88B60" strokeWidth="1.2" />
          <path d="M2 0v8M6 0v8" stroke="#D6BA90" strokeWidth=".8" opacity=".6" />
        </pattern>
        <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#202023" /><stop offset="1" stopColor="#131315" />
        </linearGradient>
        <linearGradient id="screenOff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C1C21" /><stop offset="1" stopColor="#09090B" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8D9096" /><stop offset=".45" stopColor="#E2E4E7" /><stop offset="1" stopColor="#7D8086" />
        </linearGradient>
        <linearGradient id="laptopAl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D5D8DC" /><stop offset="1" stopColor="#AEB2B8" />
        </linearGradient>
        <linearGradient id="rgb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF3B6B" /><stop offset=".25" stopColor="#B04BFF" /><stop offset=".5" stopColor="#3B6BFF" /><stop offset=".75" stopColor="#22D3EE" /><stop offset="1" stopColor="#FF3B6B" />
        </linearGradient>
        <linearGradient id="rgbV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF3B6B" /><stop offset=".33" stopColor="#B04BFF" /><stop offset=".66" stopColor="#3B6BFF" /><stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFDF4" stopOpacity=".95" />
          <stop offset=".55" stopColor="#FFF8E6" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFF4DA" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="poolGrad">
          <stop offset="0" stopColor="#FFF6DE" stopOpacity=".95" />
          <stop offset=".45" stopColor="#F3E3BC" stopOpacity=".45" />
          <stop offset="1" stopColor="#F3E3BC" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wallGlow">
          <stop offset="0" stopColor="#FFF9EA" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFF9EA" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fanGlow">
          <stop offset="0" stopColor="#7B5CFF" stopOpacity=".95" />
          <stop offset=".6" stopColor="#3B6BFF" stopOpacity=".5" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id="blur14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        <clipPath id="aboveDesk"><rect x="-200" y="0" width="1400" height="418" /></clipPath>
        <clipPath id="monitorScreen"><rect x="317" y="125" width="326" height="178" rx="2" /></clipPath>
        <clipPath id="laptopScreen"><rect x="129" y="307" width="126" height="84" rx="2" /></clipPath>
      </defs>

      {/* ================= WALL / STUDIO BACKDROP ================= */}
      <g ref={wall}>
        <g className="d-wall">
          <rect x="30" y="20" width="1220" height="700" rx="32" fill={login ? "#2B2D3A" : "#ECE8E1"} />
          <path d="M30 640h1220v48a32 32 0 0 1-32 32H62a32 32 0 0 1-32-32z" fill={login ? "#24252F" : "#E4DFD7"} />
          <line x1="30" y1="640" x2="1250" y2="640" stroke={login ? "#353747" : "#D9D3C9"} />
          {login && (
            <g transform="translate(975 80)">
              <rect width="200" height="150" rx="6" fill="#1C1E2A" stroke="#3A3D50" strokeWidth="6" />
              <line x1="100" y1="0" x2="100" y2="150" stroke="#3A3D50" strokeWidth="4" />
              <line x1="0" y1="75" x2="200" y2="75" stroke="#3A3D50" strokeWidth="4" />
              <circle cx="150" cy="40" r="14" fill="#F3EED9" />
              <circle cx="156" cy="36" r="12" fill="#1C1E2A" />
              {[[30, 30], [60, 110], [130, 120], [80, 25], [170, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#fff" opacity=".7" />)}
            </g>
          )}
          {/* framed print */}
          <g transform="translate(1000 92)" style={{ display: login ? "none" : undefined }}>
            <rect width="132" height="168" rx="3" fill="#1A1A1D" />
            <rect x="8" y="8" width="116" height="152" fill="#F7F5F1" />
            <circle cx="66" cy="70" r="30" fill="#2F45FF" opacity=".9" />
            <path d="M24 128 C48 108 84 140 108 118" stroke="#111" strokeWidth="1.5" fill="none" />
            <text x="66" y="150" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="#7A766F" letterSpacing=".8">BUILD · SHIP · REPEAT</text>
          </g>
          {/* floating wall shelf with a small plant */}
          <g transform="translate(150 150)">
            <rect x="0" y="40" width="150" height="7" rx="1.5" fill="#1A1A1D" />
            <path d="M22 40 h28 l-3 -24 h-22z" fill="#D9D2C6" />
            <path d="M36 16 C30 0 18 -6 12 -14 M36 16 C40 -2 52 -8 60 -16 M36 16 C36 2 34 -10 38 -22" stroke="#4F6B4A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <rect x="76" y="18" width="10" height="22" fill="#2F3A4A" />
            <rect x="87" y="14" width="9" height="26" fill="#C9B79C" />
            <rect x="97" y="22" width="12" height="18" fill="#8C5634" />
          </g>
          {/* warm wall glow when lamp is on */}
        </g>
      </g>

      {/* ================= DESK LAYER ================= */}
      <g ref={deskLayer}>
        {/* floor shadow */}
        <ellipse className="d-desk" cx={DESK_X + 470} cy="701" rx="500" ry="7" fill="#000" opacity=".07" filter="url(#blur6)" />

        <g transform={`translate(${DESK_X} 0)`}>
          {/* lamp glow on wall (behind everything on desk) */}
          <g ref={lightGroup} style={{ opacity: 0 }} pointerEvents="none">
            <ellipse cx="190" cy="250" rx="230" ry="190" fill="url(#wallGlow)" />
          </g>

          {/* ---------- desk structure ---------- */}
          <g className="d-desk">
            {/* back legs & stretcher */}
            <rect x="34" y="440" width="12" height="250" fill="#101012" />
            <rect x="680" y="440" width="12" height="250" fill="#101012" />
            <rect x="896" y="440" width="12" height="250" fill="#101012" />
            <rect x="46" y="626" width="634" height="9" fill="#111113" />
            {/* apron under top */}
            <rect x="20" y="430" width="900" height="14" fill="#0E0E10" />

            {/* shelves */}
            <rect x="674" y="545" width="242" height="8" fill="#17171A" />
            <rect x="674" y="545" width="242" height="2" fill="#2A2A2E" />
            <rect x="674" y="640" width="242" height="8" fill="#17171A" />
            <rect x="674" y="640" width="242" height="2" fill="#2A2A2E" />

            {/* shelf 1: books + speaker */}
            <g>
              {[
                [690, 14, 62, "#2F3A4A"], [705, 12, 54, "#C9B79C"], [718, 16, 66, "#8C5634"], [735, 11, 50, "#4F5D4A"], [747, 14, 58, "#1F1F22"],
              ].map(([x, w, h, c], i) => (
                <g key={i}>
                  <rect x={x as number} y={545 - (h as number)} width={w as number} height={h as number} fill={c as string} />
                  <rect x={(x as number) + 2} y={545 - (h as number) + 8} width={(w as number) - 4} height="2" fill="#fff" opacity=".18" />
                </g>
              ))}
              <rect x="765" y="497" width="12" height="48" fill="#A0522D" transform="rotate(-12 771 545)" />
              <rect x="800" y="497" width="98" height="48" rx="4" fill="#E6DCCB" />
              <rect x="806" y="503" width="56" height="36" rx="3" fill="#2A2724" />
              <pattern id="grill" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#4A4540" /></pattern>
              <rect x="806" y="503" width="56" height="36" rx="3" fill="url(#grill)" />
              <circle cx="878" cy="512" r="5" fill="#C8BBA5" stroke="#8C7F6A" />
              <circle cx="878" cy="529" r="5" fill="#C8BBA5" stroke="#8C7F6A" />
            </g>
            {/* shelf 2: basket + pot */}
            <g>
              <path d="M690 596 h112 l-5 44 h-102z" fill="url(#weave)" />
              <rect x="688" y="592" width="116" height="7" rx="2" fill="#B39367" />
              <rect x="818" y="626" width="74" height="7" fill="#C9B79C" />
              <rect x="822" y="633" width="70" height="7" fill="#2F3A4A" />
              <path d="M842 626 h30 l-3 -24 h-24z" fill="#1F1F22" />
              <path d="M857 602 C850 588 840 584 834 576 M857 602 C860 588 870 582 878 574 M857 602 C856 590 856 580 860 570" stroke="#5E7A55" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>

            {/* desk top */}
            <path d="M20 392 H675 L670 420 H0 Z" fill="url(#deskTop)" />
            <path d="M675 392 H920 L940 420 H670 Z" fill="url(#walnutGrain)" />
            <path d="M675 392 H920 L940 420 H670 Z" fill="#000" opacity=".08" />
            {/* front edge */}
            <rect x="0" y="420" width="670" height="13" fill="#0B0B0C" />
            <rect x="670" y="420" width="270" height="13" fill="#5E361F" />
            <rect x="670" y="420" width="270" height="1.5" fill="#A06A45" opacity=".7" />
            <rect x="0" y="420" width="670" height="1.2" fill="#3A3A3F" />
            {/* front legs */}
            <rect x="10" y="433" width="14" height="267" fill="#1A1A1D" />
            <rect x="10" y="433" width="3" height="267" fill="#2C2C31" />
            <rect x="660" y="433" width="14" height="267" fill="#1A1A1D" />
            <rect x="660" y="433" width="3" height="267" fill="#2C2C31" />
            <rect x="916" y="433" width="14" height="267" fill="#1A1A1D" />
            <rect x="916" y="433" width="3" height="267" fill="#2C2C31" />
            {[17, 667, 923].map((x) => <rect key={x} x={x - 9} y="698" width="18" height="4" rx="1" fill="#0A0A0B" />)}

            {/* desk mat */}
            <path d="M250 398 H690 L698 414 H244 Z" fill="#2A2A2E" />
            <path d="M253 399.5 H687 L694 412.5 H247.5 Z" fill="none" stroke="#38383E" strokeWidth=".8" strokeDasharray="2 2" />
          </g>

          {/* ---------- light pool on desk (under items) ---------- */}
          <g style={{ opacity: lamp ? 1 : 0, transition: "opacity .5s" }} pointerEvents="none">
            <ellipse ref={pool} cx="270" cy="407" rx="170" ry="16" fill="url(#poolGrad)" />
            <ellipse cx="270" cy="407" rx="90" ry="8" fill="#FFF8E4" opacity=".35" filter="url(#blur6)" />
          </g>

          {/* ---------- riser ---------- */}
          <g className="d-item">
            <rect x="330" y="361" width="10" height="39" fill="#141416" />
            <rect x="620" y="361" width="10" height="39" fill="#141416" />
            <rect x="336" y="361" width="288" height="31" fill="url(#oakGrain)" />
            <path d="M450 361 h60 v4 q0 5 -5 5 h-50 q-5 0 -5 -5z" fill="#1C140E" />
            <rect x="336" y="389" width="288" height="3" fill="#000" opacity=".18" />
            <rect x="328" y="351" width="304" height="10" rx="1.5" fill="#141416" />
            <rect x="328" y="351" width="304" height="1.5" fill="#34343A" />
            <rect x="612" y="372" width="9" height="5" rx="1" fill="#E8E5DF" opacity=".75" />
          </g>

          {/* ---------- monitor (interactive) ---------- */}
          <g
            role="button" tabIndex={0} aria-pressed={monitor} aria-label={monitor ? "Turn monitor off" : "Turn monitor on"}
            data-cursor={monitor ? "Sleep" : "Wake"} {...press(() => setMonitor((v) => !v))} className="d-item"
          >
            <g className="lift">
              <rect x="440" y="344" width="80" height="8" rx="2" fill="#1A1A1D" />
              <rect x="472" y="300" width="16" height="48" fill="#1A1A1D" />
              <rect x="472" y="300" width="3" height="48" fill="#2E2E33" />
              <rect x="310" y="118" width="340" height="200" rx="7" fill="#0E0E10" />
              <rect x="310" y="118" width="340" height="200" rx="7" fill="none" stroke="#2A2A2F" />
              <rect x="317" y="125" width="326" height="178" rx="2" fill="url(#screenOff)" />
              <path d="M317 125 L420 125 L340 303 L317 303 Z" fill="#fff" opacity=".035" />
              <circle cx="630" cy="311" r="1.6" fill={monitor ? "#5EEAD4" : "#3A3A40"} />
              {/* screen content */}
              <g clipPath="url(#monitorScreen)">
                <g ref={screenOn} style={{ opacity: 0 }}>
                  <rect x="317" y="125" width="326" height="178" fill="#0F1117" />
                  <rect x="317" y="125" width="326" height="14" fill="#161923" />
                  <circle cx="326" cy="132" r="2.4" fill="#FF5F57" /><circle cx="334" cy="132" r="2.4" fill="#FEBC2E" /><circle cx="342" cy="132" r="2.4" fill="#28C840" />
                  <text x="480" y="134.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#6B7280">{name.split(" ").pop()?.toLowerCase()}.ts — portfolio</text>
                  <rect x="317" y="139" width="62" height="164" fill="#12151C" />
                  {["src", "app", "hero.tsx", "work.tsx", "globe.tsx", "about.tsx"].map((f, i) => (
                    <text key={f} x={i > 1 ? 333 : 325} y={156 + i * 13} fontFamily="var(--font-mono)" fontSize="6.5" fill={i === 2 ? "#E5E7EB" : "#6B7280"}>{i < 2 ? "▾ " : ""}{f}</text>
                  ))}
                  <rect x="379" y="139" width="1" height="164" fill="#1F2430" />
                  {code.map((_, i) => (
                    <text key={i} x="386" y={158 + i * 17} fontFamily="var(--font-mono)" fontSize="7.5" fill="#3B4252">{i + 1}</text>
                  ))}
                  {codeLines.map((spans, i) => (
                    <text key={i} x="400" y={158 + i * 17} fontFamily="var(--font-mono)" fontSize="9.5" xmlSpace="preserve">{spans}</text>
                  ))}
                  <rect className="caret" x={400 + Math.max(0, (() => { let n = 0; for (let k = 0; k < caretLine; k++) n += code[k].reduce((m, t) => m + t[0].length, 0) + 1; return Math.min(typed - n, code[caretLine].reduce((m, t) => m + t[0].length, 0)); })()) * 5.72} y={150 + caretLine * 17} width="5" height="10" fill="#82AAFF" opacity=".9" />
                  <rect x="317" y="294" width="326" height="9" fill="#2F45FF" />
                  <text x="322" y="300.6" fontFamily="var(--font-mono)" fontSize="5.5" fill="#fff">● main   TypeScript   UTF-8</text>
                  <text x="638" y="300.6" textAnchor="end" fontFamily="var(--font-mono)" fontSize="5.5" fill="#fff">{clock?.label ?? ""} GMT+6</text>
                </g>
              </g>
              <rect className="focus-ring" x="304" y="112" width="352" height="212" rx="10" fill="none" stroke="#2F45FF" strokeWidth="2" />
            </g>
          </g>

          {/* ---------- keyboard ---------- */}
          <g className="d-item" role="button" tabIndex={0} aria-label="Keyboard" data-cursor="RGB" {...press(() => setMonitor(true))}>
            <rect className="rgb" x="364" y="408" width="232" height="7" rx="3" fill="url(#rgb)" style={{ opacity: monitor ? 0.75 : 0.35, ["--b" as string]: "4px", transition: "opacity .6s" }} />
            <path d="M368 399 H592 L598 412 H362 Z" fill="#1C1C1F" />
            <path d="M368 399 H592 L593 401 H367 Z" fill="#2E2E33" />
            {[0, 1, 2].map((r) =>
              Array.from({ length: 16 }).map((_, k) => {
                const y = 401.6 + r * 3.4;
                const xStart = 371 - r * 1.2 + (r === 1 ? 4 : r === 2 ? 8 : 0);
                const w = r === 2 && k === 6 ? 52 : 11.2;
                if (r === 2 && k > 6 && k < 11) return null;
                const x = xStart + k * 13.6 + (r === 2 && k >= 11 ? -4 * 13.6 + 40 : 0);
                return <rect key={`${r}-${k}`} x={x} y={y} width={w} height="2.6" rx=".6" fill="#2B2B30" />;
              }),
            )}
          </g>

          {/* ---------- mouse ---------- */}
          <g className="d-item" role="button" tabIndex={0} aria-label="Mouse" data-cursor="Click" {...press(() => setMonitor(true))}>
            <ellipse className="rgb" cx="628" cy="410" rx="13" ry="3" fill="url(#rgb)" style={{ opacity: monitor ? 0.8 : 0.35, ["--b" as string]: "2.5px" }} />
            <ellipse cx="628" cy="405" rx="11" ry="5.5" fill="#1C1C1F" />
            <path d="M628 399.6 V404" stroke="#3A3A40" strokeWidth=".8" />
            <ellipse cx="623" cy="403" rx="4" ry="1.4" fill="#fff" opacity=".07" />
          </g>

          {/* ---------- PC tower (interactive: power) ---------- */}
          <g role="button" tabIndex={0} aria-pressed={monitor} aria-label={monitor ? "Shut down PC" : "Power on PC"} data-cursor={monitor ? "Power off" : "Power on"} className={`d-item ${monitor ? "fan-on" : ""}`} {...press(() => setMonitor((v) => !v))}>
            <g className="lift">
              <path d="M700 222 H785 L800 214 H715 Z" fill="#26262A" />
              <path d="M785 222 L800 214 V393 L785 401 Z" fill="#0E0E10" />
              <rect x="700" y="222" width="85" height="179" rx="3" fill="#18181B" />
              {/* fans behind mesh */}
              {[278, 350].map((cy) => (
                <g key={cy}>
                  <circle className="rgb" cx="742" cy={cy} r="30" fill="url(#fanGlow)" style={{ opacity: monitor ? 1 : 0.12, ["--b" as string]: "5px", transition: "opacity .8s" }} />
                  <circle cx="742" cy={cy} r="26" fill="none" stroke="#2A2A2F" strokeWidth="2" />
                  <g className="fan-blades">
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <path key={a} d={`M742 ${cy} q 9 -6 18 -18 q -10 4 -18 18`} fill="#1E1E22" opacity=".95" transform={`rotate(${a} 742 ${cy})`} />
                    ))}
                    <circle cx="742" cy={cy} r="5" fill="#141416" />
                  </g>
                </g>
              ))}
              <rect x="708" y="240" width="69" height="152" rx="3" fill="url(#pcMesh)" />
              <rect className="rgb-sharp" x="702.5" y="240" width="2" height="152" rx="1" fill="url(#rgbV)" style={{ opacity: monitor ? 0.9 : 0.2, transition: "opacity .6s" }} />
              <circle cx="742" cy="231" r="3" fill="#0B0B0C" stroke="#3A3A40" />
              <circle cx="742" cy="231" r="1.2" fill={monitor ? "#5EEAD4" : "#3A3A40"} />
              <rect className="focus-ring" x="694" y="208" width="112" height="198" rx="6" fill="none" stroke="#2F45FF" strokeWidth="2" />
            </g>
          </g>

          {/* ---------- bottle ---------- */}
          <g className="d-item">
            <rect x="809" y="300" width="17" height="15" rx="3" fill="#1C1C1F" />
            <rect x="805" y="312" width="25" height="88" rx="8" fill="#6E7F6A" />
            <rect x="809" y="320" width="3.5" height="70" rx="1.75" fill="#fff" opacity=".18" />
            <rect x="805" y="352" width="25" height="10" fill="#5E6E5A" />
          </g>

          {/* ---------- books + live clock ---------- */}
          <g className="d-item">
            <rect x="842" y="386" width="72" height="14" rx="1.5" fill="#2F3A4A" />
            <rect x="842" y="386" width="72" height="2" fill="#fff" opacity=".12" />
            <rect x="846" y="376" width="66" height="10" rx="1.5" fill="#E9E1D1" />
            <rect x="909" y="377" width="3" height="8" fill="#C9B79C" />
            <rect x="844" y="368" width="70" height="8" rx="1.5" fill="#8C5634" />
            <rect x="853" y="341" width="52" height="27" rx="4" fill="#141416" />
            <rect x="853" y="341" width="52" height="2" rx="1" fill="#2E2E33" />
            <text x="879" y="359.5" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="600" fill="#F5F3EF" letterSpacing=".5">{clock ? `${clock.h}:${clock.m}` : "--:--"}</text>
          </g>

          {/* ---------- laptop (interactive) ---------- */}
          <g
            role="button" tabIndex={0} aria-pressed={laptop} aria-label={laptop ? "Close laptop" : "Open laptop"}
            data-cursor={laptop ? "Close" : "Open"} {...press(() => setLaptop((v) => !v))} className="d-item"
          >
            <rect x="100" y="280" width="185" height="140" fill="transparent" />
            <g className="lift">
              {/* open lid */}
              <g ref={lid} style={{ opacity: 0 }}>
                <rect x="122" y="300" width="140" height="99" rx="5" fill="#A9ADB3" />
                <rect x="124" y="302" width="136" height="96" rx="4" fill="#0F0F11" />
                <g clipPath="url(#laptopScreen)">
                  <rect x="129" y="307" width="126" height="84" fill="#0E1015" />
                  <rect x="129" y="307" width="126" height="9" fill="#171A22" />
                  <circle cx="134" cy="311.5" r="1.5" fill="#FF5F57" /><circle cx="139" cy="311.5" r="1.5" fill="#FEBC2E" /><circle cx="144" cy="311.5" r="1.5" fill="#28C840" />
                  <text x="133" y="327" fontFamily="var(--font-mono)" fontSize="6" fill="#9CA3AF">~/portfolio <tspan fill="#C792EA">$</tspan> <tspan fill="#E5E7EB">npm run dev</tspan></text>
                  <text x="133" y="338" fontFamily="var(--font-mono)" fontSize="6" fill="#5EEAD4">✓ Ready in 1.2s</text>
                  <text x="133" y="349" fontFamily="var(--font-mono)" fontSize="6" fill="#9CA3AF">→ Local: <tspan fill="#82AAFF">localhost:3000</tspan></text>
                  <text x="133" y="360" fontFamily="var(--font-mono)" fontSize="6" fill="#9CA3AF">→ Supabase: <tspan fill="#5EEAD4">connected</tspan></text>
                  <text x="133" y="375" fontFamily="var(--font-mono)" fontSize="6" fill="#9CA3AF">~/portfolio <tspan fill="#C792EA">$</tspan> <tspan className="caret" fill="#E5E7EB">▍</tspan></text>
                </g>
              </g>
              {/* base */}
              <path d="M116 400 H268 L273 411 H111 Z" fill="url(#laptopAl)" />
              <path d="M111 411 H273 V413.5 Q273 415 271 415 H113 Q111 415 111 413.5 Z" fill="#9A9EA4" />
              <rect x="176" y="411.2" width="32" height="1.6" rx=".8" fill="#888C92" />
              {/* closed lid */}
              <g style={{ opacity: laptop ? 0 : 1, transition: "opacity .25s" }}>
                <path d="M118 396.5 H266 L268 400.5 H116 Z" fill="#BFC3C8" />
                <path d="M118 396.5 H266 L266.4 397.4 H117.6 Z" fill="#E6E8EB" />
              </g>
              <rect className="focus-ring" x="104" y="292" width="176" height="130" rx="8" fill="none" stroke="#2F45FF" strokeWidth="2" />
            </g>
          </g>

          {/* ---------- coffee mug + steam ---------- */}
          <g className="d-item">
            <g ref={steam}>
              <g className="steam" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 1.5px rgba(80,60,40,.25))" }}>
                <path d="M296 366 C291 356 301 350 296 340 C292 332 299 326 297 320" />
                <path d="M304 366 C299 355 309 349 304 338 C300 330 307 324 305 316" />
                <path d="M312 366 C307 357 317 351 312 341 C308 333 315 327 313 321" />
              </g>
            </g>
            <path d="M321 381 c11 0 13 18 0 21" fill="none" stroke="#EDE8E1" strokeWidth="5" />
            <path d="M285 372 h37 v34 q0 8 -8 8 h-21 q-8 0 -8 -8 z" fill="#F2EEE8" />
            <path d="M285 372 h6 v36 q-6 -1 -6 -6 z" fill="#fff" opacity=".6" />
            <ellipse cx="303.5" cy="372.5" rx="18.5" ry="3.2" fill="#E2DCD3" />
            <ellipse cx="303.5" cy="373" rx="16" ry="2.4" fill="#3B2416" />
            <rect x="290" y="390" width="27" height="1.2" fill="#111" opacity=".25" />
          </g>

          {/* ---------- lamp (interactive) ---------- */}
          <g role="button" tabIndex={0} aria-pressed={lamp} aria-label={lamp ? "Turn lamp off" : "Turn lamp on"} data-cursor={lamp ? "Lights off" : "Lights on"} {...press(() => setLamp((v) => !v))} className="d-item">
            <rect x="20" y="190" width="200" height="225" fill="transparent" />
            {/* base */}
            <ellipse cx="60" cy="404" rx="31" ry="6" fill="#121214" />
            <ellipse cx="60" cy="401.5" rx="27" ry="4.5" fill="#1C1C1F" />
            <ellipse cx="60" cy="401.5" rx="22" ry="3.4" fill="none" stroke="#B08D57" strokeWidth="1.5" />
            {/* arms */}
            <line x1="60" y1="400" x2="80" y2="256" stroke="#1A1A1D" strokeWidth="5" strokeLinecap="round" />
            <line x1="80" y1="256" x2={PIVOT.x} y2={PIVOT.y} stroke="#1A1A1D" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="80" cy="256" r="5" fill="#B08D57" />
            <circle cx="60" cy="398" r="4" fill="#B08D57" />

            {/* light cone (clipped to above the desk) */}
            <g clipPath="url(#aboveDesk)" pointerEvents="none">
              <g ref={shade} transform={`translate(${PIVOT.x} ${PIVOT.y}) rotate(${BASE_ANGLE})`}>
                <g style={{ opacity: lamp ? 1 : 0, transition: lamp ? "opacity .08s" : "opacity .5s" }}>
                  <path d="M-24 44 L24 44 L150 262 L-150 262 Z" fill="url(#cone)" opacity=".9" filter="url(#blur3)" />
                  <path d="M-16 44 L16 44 L80 262 L-80 262 Z" fill="url(#cone)" opacity=".6" />
                  {[[-20, 120, 6, -18, -40], [30, 160, 7.5, 14, -50], [0, 200, 5, -10, -60], [-50, 220, 8, 20, -46], [40, 100, 6.5, -16, -36]].map(([x, y, t, dx, dy], i) => (
                    <circle key={i} className="mote" cx={x} cy={y} r="1.1" fill="#fff" style={{ ["--t" as string]: `${t}s`, ["--d" as string]: `${i * 0.9}s`, ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }} />
                  ))}
                </g>
                {/* shade */}
                <path d="M-11 -4 L11 -4 L30 42 Q0 50 -30 42 Z" fill="#6E6E72" />
                <path d="M-11 -4 L-3 -4 L-14 44 Q-22 43.6 -30 42 Z" fill="#8A8A8F" opacity=".7" />
                <path d="M-11 -4 L11 -4 L13 2 L-13 2 Z" fill="#4E4E52" />
                <ellipse cx="0" cy="43" rx="30" ry="6" fill="#2A2A2E" />
                <ellipse cx="0" cy="43" rx="18" ry="3.6" fill={lamp ? "#FFF8DC" : "#3A3A3E"} style={{ transition: "fill .3s" }} />
                {lamp && <ellipse cx="0" cy="44" rx="26" ry="8" fill="#FFF6D6" opacity=".9" filter="url(#blur6)" />}
                <circle cx="0" cy="0" r="5.5" fill="#B08D57" />
              </g>
            </g>
            <rect className="focus-ring" x="18" y="188" width="204" height="228" rx="10" fill="none" stroke="#2F45FF" strokeWidth="2" />
          </g>
        </g>
      </g>

      {/* ================= CHAIR (front layer) ================= */}
      <g ref={chairLayer}>
        <g className="d-chair">
          <ellipse cx="135" cy="700" rx="110" ry="9" fill="#000" opacity=".1" filter="url(#blur6)" />
          {/* base */}
          {[[44, 690], [96, 706], [186, 702], [226, 684], [132, 676]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M130 662 L${x} ${y - 10}`} stroke="#141416" strokeWidth="9" strokeLinecap="round" />
              <circle cx={x} cy={y} r="8.5" fill="#0E0E10" />
              <circle cx={x - 2} cy={y - 2} r="2.5" fill="#2A2A2E" />
            </g>
          ))}
          <ellipse cx="130" cy="661" rx="17" ry="6" fill="#1A1A1D" />
          {/* gas lift */}
          <rect x="122" y="596" width="16" height="64" fill="#141416" />
          <rect x="124.5" y="558" width="11" height="42" fill="url(#chrome)" />
          {/* mechanism + lever */}
          <rect x="94" y="552" width="74" height="13" rx="3" fill="#141416" />
          <path d="M98 562 L62 580" stroke="#141416" strokeWidth="3.5" strokeLinecap="round" />
          {/* backrest */}
          <path d="M30 520 C22 444 26 362 44 302 C50 284 64 276 82 278 L118 282 C132 284 138 296 136 312 C128 380 120 452 112 520 Z" fill="#141416" />
          <path d="M38 512 C32 444 35 368 51 310 C56 294 66 289 82 290 L116 293 C126 295 128 304 126 316 C119 382 112 448 104 512 Z" fill="url(#mesh)" />
          <path d="M44 430 C60 420 92 420 110 432 L106 470 C88 460 62 460 40 470 Z" fill="#101012" opacity=".75" />
          {/* headrest */}
          <rect x="88" y="262" width="10" height="22" fill="#141416" />
          <path d="M58 232 C58 222 66 216 78 216 L118 218 C128 219 134 226 133 236 L131 256 C130 264 124 268 116 268 L72 266 C62 266 58 260 58 252 Z" fill="#151517" />
          <path d="M64 236 C64 228 70 224 79 224 L116 226 C124 227 127 232 126 240 L125 250 C124 256 120 259 114 259 L74 258 C67 258 64 254 64 248 Z" fill="url(#mesh)" />
          {/* far armrest */}
          <path d="M36 466 L86 462 C92 462 92 470 86 471 L38 474 Z" fill="#0E0E10" />
          {/* seat */}
          <path d="M40 528 C40 514 60 508 120 508 L200 512 C220 514 232 522 230 534 L226 550 C224 558 212 562 196 562 L64 560 C48 560 40 552 40 542 Z" fill="#19191C" />
          <path d="M48 524 C52 516 70 514 120 514 L198 517 C214 518 222 522 222 528 C200 524 120 522 48 528 Z" fill="#2A2A2E" />
          {/* near armrest */}
          <path d="M196 478 L206 478 L203 520 L193 520 Z" fill="#141416" />
          <path d="M148 470 L220 465 C228 465 230 474 224 478 L154 483 C146 484 142 472 148 470 Z" fill="#121214" />
          <path d="M152 471 L218 466.5" stroke="#2C2C31" strokeWidth="1.2" />
        </g>
      </g>
    </svg>
  );
}
