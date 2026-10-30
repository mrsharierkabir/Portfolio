import Link from "next/link";
import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { coverDataUrl } from "@/lib/cover";
import { pad2 } from "@/lib/utils";
import Reveal from "@/components/site/Reveal";
import SplitReveal from "@/components/site/SplitReveal";

export const revalidate = 300;
export const metadata: Metadata = { title: "Projects", description: "Everything I've designed, built and shipped.", alternates: { canonical: "/projects" } };

export default async function ProjectsPage() {
  const projects = (await getProjects()).filter((p) => p.published !== false);
  return (
    <div className="container-x pb-28 pt-36 md:pt-44">
      <p className="eyebrow">Archive · {pad2(projects.length)} projects</p>
      <SplitReveal as="h1" immediate className="display mt-6 max-w-4xl text-[clamp(2.75rem,7vw,6rem)]">
        Everything I&apos;ve <span className="serif-accent">built.</span>
      </SplitReveal>
      <Reveal stagger={0.08} className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <Link key={p.id} href={`/projects/${p.slug}`} className="group block" data-cursor="View">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-paper-2">
              <img
                src={p.cover_url || coverDataUrl(p)}
                alt={`${p.title} preview`}
                className={`w-full transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] ${p.device === "mobile" ? "mx-auto aspect-[16/10] object-contain py-6" : "aspect-[16/10] object-cover"}`}
              />
            </div>
            <div className="mt-5 flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-xs text-muted">{pad2(i + 1)} · {p.category}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{p.title}</h2>
                <p className="mt-2 max-w-lg text-ink-2">{p.summary}</p>
              </div>
              <span aria-hidden className="mt-6 text-xl transition-transform duration-500 group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </Reveal>
    </div>
  );
}
