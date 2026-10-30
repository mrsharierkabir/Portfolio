"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import SectionHeading from "../site/SectionHeading";
import Reveal from "../site/Reveal";
import Roll from "../site/Roll";

export default function BlogPreview({ posts }: { posts: Post[] }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const [cover, setCover] = useState<string | null>(null);
  const move = (e: React.PointerEvent) => {
    if (!box.current || !img.current) return;
    const r = box.current.getBoundingClientRect();
    img.current.style.transform = `translate(${e.clientX - r.left + 24}px, ${e.clientY - r.top - 90}px)`;
  };
  const list = posts.slice(0, 4);

  return (
    <section id="writing" className="border-t border-line py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="06"
          eyebrow="Writing"
          title={<>Notes from <span className="serif-accent">the desk.</span></>}
          intro="What I learn while building — databases, interfaces and shipping."
        />
        {list.length === 0 ? (
          <Reveal className="mt-16 flex flex-col items-start gap-6 rounded-2xl border border-dashed border-line p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xl font-medium text-ink">First posts are on their way.</p>
              <p className="mt-2 text-ink-2">Write-ups on the projects above are being drafted now.</p>
            </div>
            <Link href="/blog" className="btn btn-secondary"><Roll>Visit the blog</Roll><span aria-hidden>→</span></Link>
          </Reveal>
        ) : (
          <div ref={box} onPointerMove={move} onPointerLeave={() => setCover(null)} className="relative mt-16">
            <div ref={img} className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[180px] w-[260px] overflow-hidden rounded-xl shadow-[var(--shadow-lift)] transition-opacity duration-300 md:block" style={{ opacity: cover ? 1 : 0 }}>
              {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
            </div>
            <Reveal stagger={0.07} className="border-t border-line">
              {list.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  onPointerEnter={() => setCover(p.cover_url)}
                  className="group grid items-baseline gap-2 border-b border-line py-7 md:grid-cols-12 md:gap-6"
                  data-cursor="Read"
                >
                  <span className="font-mono text-xs text-muted md:col-span-2">{formatDate(p.published_at)}</span>
                  <span className="text-2xl font-medium tracking-[-0.02em] text-ink transition-transform duration-500 group-hover:translate-x-2 md:col-span-7">{p.title}</span>
                  <span className="flex flex-wrap gap-2 md:col-span-2">{p.tags.slice(0, 2).map((t) => <span key={t} className="chip">{t}</span>)}</span>
                  <span className="hidden text-right text-muted transition-transform duration-500 group-hover:translate-x-1 md:col-span-1 md:block">→</span>
                </Link>
              ))}
            </Reveal>
            <div className="mt-10"><Link href="/blog" className="btn btn-secondary"><Roll>All posts</Roll><span aria-hidden>→</span></Link></div>
          </div>
        )}
      </div>
    </section>
  );
}
