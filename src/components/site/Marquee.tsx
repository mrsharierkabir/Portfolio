export default function Marquee({ items, speed = 40 }: { items: string[]; speed?: number }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" aria-hidden>
      <div className="flex w-max gap-10" style={{ animation: `marquee ${speed}s linear infinite` }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-[-0.03em] text-ink">
            {i % 2 ? <span className="serif-accent text-muted">{t}</span> : t}
            <span className="h-2 w-2 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
