import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { renderPost } from "@/lib/post-html";
import { formatDate, siteUrl } from "@/lib/utils";
import SplitReveal from "@/components/site/SplitReveal";
import Reveal from "@/components/site/Reveal";
import ReadingProgress from "./ReadingProgress";

export const revalidate = 120;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  const title = p.seo_title || p.title;
  const description = p.seo_description || p.excerpt || undefined;
  return { title, description, alternates: { canonical: `/blog/${p.slug}` }, openGraph: { type: "article", title, description, publishedTime: p.published_at ?? undefined, images: p.cover_url ? [p.cover_url] : undefined } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p || p.status !== "published" || !p.published_at || new Date(p.published_at) > new Date()) notFound();
  const [all, s] = await Promise.all([getPosts(), getSettings()]);
  const i = all.findIndex((x) => x.slug === p.slug);
  const prev = all[i + 1], next = all[i - 1];
  const { html, toc } = renderPost(p.content_html ?? "");
  const url = `${siteUrl()}/blog/${p.slug}`;
  const ld = { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, datePublished: p.published_at, author: { "@type": "Person", name: s.name }, image: p.cover_url ?? undefined, url };

  return (
    <article className="pb-24 pt-36 md:pt-44">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="container-x max-w-[920px]">
        <Link href="/blog" className="block w-fit font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-ink">← All posts</Link>
        <p className="mt-10 font-mono text-xs text-muted">{formatDate(p.published_at)} · {p.reading_minutes} min read</p>
        <SplitReveal as="h1" immediate className="mt-5 text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">{p.title}</SplitReveal>
        {p.excerpt && <Reveal delay={0.2}><p className="mt-6 text-xl leading-relaxed text-ink-2">{p.excerpt}</p></Reveal>}
        <div className="mt-6 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      </div>
      {p.cover_url && (
        <Reveal className="container-x mt-12 max-w-[1120px]"><img src={p.cover_url} alt="" className="w-full rounded-3xl border border-line" /></Reveal>
      )}
      <div className="container-x mt-14 grid max-w-[1120px] gap-12 lg:grid-cols-[1fr_220px]">
        <div className="prose-post min-w-0 max-w-[700px]" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 1 && (
          <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-28 lg:block">
            <p className="eyebrow">On this page</p>
            <ul className="mt-5 space-y-2.5 border-l border-line text-sm">
              {toc.map((t) => (
                <li key={t.id} className={t.level === 3 ? "pl-7" : "pl-4"}><a href={`#${t.id}`} className="text-ink-2 hover:text-ink">{t.text}</a></li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="container-x mt-16 max-w-[920px]">
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-8">
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">Share</span>
          <a className="chip hover:!border-ink" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
          <a className="chip hover:!border-ink" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(p.title)}`}>X</a>
          <a className="chip hover:!border-ink" href={`mailto:?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(url)}`}>Email</a>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {prev ? <Link href={`/blog/${prev.slug}`} className="card block p-6 hover:border-ink/30"><span className="font-mono text-xs text-muted">← Older</span><span className="mt-2 block font-medium">{prev.title}</span></Link> : <span />}
          {next && <Link href={`/blog/${next.slug}`} className="card block p-6 text-right hover:border-ink/30"><span className="font-mono text-xs text-muted">Newer →</span><span className="mt-2 block font-medium">{next.title}</span></Link>}
        </div>
      </div>
    </article>
  );
}
