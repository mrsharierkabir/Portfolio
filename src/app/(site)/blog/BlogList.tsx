"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function BlogList({ posts }: { posts: Post[] }) {
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);
  const [tag, setTag] = useState<string | null>(null);
  const list = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;
  const [featured, ...rest] = list;

  if (!posts.length) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-line p-10">
        <p className="text-xl font-medium">Nothing published yet.</p>
        <p className="mt-2 text-ink-2">The first posts are being written — check back soon.</p>
      </div>
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2" role="toolbar" aria-label="Filter by tag">
          {[null, ...tags].map((t) => (
            <button key={t ?? "all"} onClick={() => setTag(t)} aria-pressed={tag === t} className={`chip !h-9 !px-4 transition ${tag === t ? "!border-ink bg-ink !text-paper" : "hover:!border-ink"}`}>
              {t ?? "All"}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {featured && (
          <motion.div key={featured.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <Link href={`/blog/${featured.slug}`} className="group mt-12 grid gap-8 rounded-3xl border border-line bg-card p-4 md:grid-cols-2 md:p-6" data-cursor="Read">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-paper-2">
                {featured.cover_url && <img src={featured.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />}
              </div>
              <div className="flex flex-col justify-center p-2">
                <p className="font-mono text-xs text-muted">{formatDate(featured.published_at)} · {featured.reading_minutes} min read</p>
                <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-tight tracking-[-0.035em]">{featured.title}</h2>
                {featured.excerpt && <p className="mt-4 text-ink-2">{featured.excerpt}</p>}
                <div className="mt-6 flex flex-wrap gap-2">{featured.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {rest.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Link href={`/blog/${p.slug}`} className="group block h-full rounded-2xl border border-line bg-card p-4" data-cursor="Read">
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-paper-2">
                  {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />}
                </div>
                <p className="mt-5 font-mono text-xs text-muted">{formatDate(p.published_at)} · {p.reading_minutes} min</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{p.title}</h3>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink-2">{p.excerpt}</p>}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
