import SplitReveal from "./SplitReveal";
import Reveal from "./Reveal";

type Props = { index: string; eyebrow: string; title: React.ReactNode; intro?: string; dark?: boolean; align?: "left" | "split" };

export default function SectionHeading({ index, eyebrow, title, intro, dark, align = "split" }: Props) {
  return (
    <div className={align === "split" ? "grid gap-8 md:grid-cols-12 md:items-end" : "grid gap-6"}>
      <div className={align === "split" ? "md:col-span-7" : ""}>
        <Reveal className="mb-6 flex items-center gap-4">
          <span className={`font-mono text-xs ${dark ? "text-white/40" : "text-muted"}`}>{index}</span>
          <span className={`eyebrow ${dark ? "!text-white/60" : ""}`}>{eyebrow}</span>
        </Reveal>
        <SplitReveal className={`h2 ${dark ? "text-white" : "text-ink"}`}>{title}</SplitReveal>
      </div>
      {intro && (
        <Reveal delay={0.15} className={align === "split" ? "md:col-span-4 md:col-start-9" : "max-w-xl"}>
          <p className={`text-[1.05rem] leading-relaxed ${dark ? "text-white/60" : "text-ink-2"}`}>{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
