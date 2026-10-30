"use client";
import { useRef } from "react";

/** Photo if uploaded; otherwise a premium monogram "ID card". Tilts gently toward the cursor. */
export default function Portrait({ name, initials, avatarUrl, location }: { name: string; initials: string; avatarUrl: string; location: string }) {
  const card = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const reset = () => { if (card.current) card.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)"; };
  const first = name.split(" ").slice(-2).join(" ");
  return (
    <div onPointerMove={onMove} onPointerLeave={reset} className="[perspective:900px]">
      <div
        ref={card}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-ink text-paper shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Portrait of ${name}`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 [background:radial-gradient(80%_60%_at_30%_20%,#2a2a33,#111_60%)]" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-serif text-[clamp(7rem,14vw,11rem)] italic leading-none tracking-[-0.04em] text-paper/95">{initials.slice(-2).toLowerCase()}</span>
            </div>
            <div className="absolute right-[18%] top-[30%] h-3 w-3 rounded-full bg-accent shadow-[0_0_24px_6px_rgba(47,69,255,.6)]" />
          </>
        )}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(40%_40%_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,.14),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 flex justify-between p-5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/60">
          <span>Portfolio · {new Date().getFullYear()}</span><span>{initials}</span>
        </div>
        <div className={`absolute inset-x-0 bottom-0 p-5 ${avatarUrl ? "bg-gradient-to-t from-black/70 to-transparent pt-16" : ""}`}>
          <p className="text-2xl font-semibold tracking-[-0.03em]">{first}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-white/60">{location}</p>
        </div>
      </div>
    </div>
  );
}
