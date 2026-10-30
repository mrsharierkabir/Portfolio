import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects, getPresence } from "@/lib/data";
import { coverDataUrl } from "@/lib/cover";
import { hostOf } from "@/lib/utils";
import Reveal from "@/components/site/Reveal";
import SplitReveal from "@/components/site/SplitReveal";
import Roll from "@/components/site/Roll";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.summary ?? undefined, alternates: { canonical: `/projects/${p.slug}` }, openGraph: { title: p.title, description: p.summary ?? undefined, images: p.cover_url ? [p.cover_url] : undefined } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) notFound();
  const all = (await getProjects()).filter((x) => x.published !== false);
  const idx = all.findIndex((x) => x.slug === p.slug);
  const next = all[(idx + 1) % all.length];
  const countryCount = p.country ? (await getPresence()).filter((x) => x.country === p.country).length : 0;
  const cover = p.cover_url || coverDataUrl(p);
  const meta = [
    { k: "Role", v: p.role },
    { k: "Year", v: p.year },
    { k: "Client", v: p.client },
    { k: "Country", v: p.country },
  ].filter((m) => m.v);

  return (
    <article className="pb-10 pt-36 md:pt-44">
      <div className="container-x">
        <Link href="/projects" className="block w-fit font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-ink">← All projects</Link>
        <p className="eyebrow mt-10">{p.category}</p>
        <SplitReveal as="h1" immediate className="display mt-6 text-[clamp(3rem,9vw,8rem)]">{p.title}</SplitReveal>
        <Reveal delay={0.2} className="mt-8 grid gap-10 md:grid-cols-12">
          <p className="text-[clamp(1.2rem,2vw,1.5rem)] leading-snug tracking-[-0.015em] text-ink-2 md:col-span-7">{p.summary}</p>
          <div className="flex flex-wrap items-start gap-3 md:col-span-4 md:col-start-9 md:justify-end">
            {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="btn btn-primary"><Roll>Visit site</Roll><span aria-hidden>↗</span></a>}
            {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="btn btn-secondary"><Roll>Source code</Roll><span aria-hidden>↗</span></a>}
          </div>
        </Reveal>
      </div>

      <Reveal className="container-x mt-16">
        <div className={`overflow-hidden rounded-3xl border border-line ${p.device === "mobile" ? "bg-ink py-12" : "bg-paper-2"}`} style={p.device === "mobile" ? { background: p.accent ?? undefined } : undefined}>
          <img src={cover} alt={`${p.title} cover`} className={p.device === "mobile" ? "mx-auto max-h-[640px] rounded-[36px] border-[10px] border-ink shadow-[var(--shadow-lift)]" : "w-full"} />
        </div>
      </Reveal>

      <div className="container-x mt-20 grid gap-14 md:grid-cols-12">
        <aside className="md:col-span-4">
          <Reveal stagger={0.06} className="divide-y divide-line border-y border-line">
            {meta.map((m) => (
              <div key={m.k} className="flex justify-between gap-6 py-4">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{m.k}</span>
                <span className="text-right text-ink">{m.v}{m.k === "Country" && countryCount > 1 ? <span className="text-muted"> · {countryCount} projects</span> : null}</span>
              </div>
            ))}
            {p.live_url && (
              <div className="flex justify-between gap-6 py-4">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">Live</span>
                <a href={p.live_url} target="_blank" rel="noreferrer" className="link-u text-ink">{hostOf(p.live_url)}</a>
              </div>
            )}
          </Reveal>
          {p.stack.length > 0 && (
            <Reveal className="mt-8">
              <p className="eyebrow">Stack</p>
              <div className="mt-4 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </Reveal>
          )}
        </aside>
        <div className="md:col-span-7 md:col-start-6">
          <Reveal>
            <p className="eyebrow">Overview</p>
            <div className="mt-6 space-y-5 text-[1.08rem] leading-relaxed text-ink-2">
              {(p.description || "").split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </Reveal>
          {p.features.length > 0 && (
            <Reveal className="mt-14">
              <p className="eyebrow">Key features</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {p.features.map((f, i) => (
                  <li key={f} className="flex gap-4 rounded-xl border border-line bg-card p-4">
                    <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-ink">{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      {p.gallery.length > 0 && (
        <div className="container-x mt-20 grid gap-6 md:grid-cols-2">
          {p.gallery.map((g, i) => (
            <Reveal key={g} className={i % 3 === 0 ? "md:col-span-2" : ""}>
              <img src={g} alt={`${p.title} screenshot ${i + 1}`} className="w-full rounded-2xl border border-line" loading="lazy" />
            </Reveal>
          ))}
        </div>
      )}

      {next && next.slug !== p.slug && (
        <Link href={`/projects/${next.slug}`} className="group mt-28 block border-t border-line" data-cursor="Next">
          <div className="container-x flex items-end justify-between gap-6 py-16">
            <div>
              <p className="eyebrow">Next project</p>
              <p className="mt-4 text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-none tracking-[-0.045em] transition-transform duration-700 group-hover:translate-x-3">{next.title}</p>
            </div>
            <span aria-hidden className="text-4xl transition-transform duration-700 group-hover:translate-x-2">→</span>
          </div>
        </Link>
      )}
    </article>
  );
}
