"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { sb, publishChanges } from "./client";
import { useToast } from "./Toast";
import FieldRenderer from "./FieldRenderer";
import ConfirmDelete from "./ConfirmDelete";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false, loading: () => <div className="h-[560px] animate-pulse rounded-2xl border border-line bg-card" /> });

type Draft = Omit<Post, "id"> & { id?: string };
const blank: Draft = {
  slug: "", title: "", excerpt: "", content_html: "", content_json: null, cover_url: null, tags: [], status: "draft",
  published_at: null, featured: false, seo_title: "", seo_description: "", reading_minutes: 1,
};

export default function PostEditor({ id }: { id: string }) {
  const isNew = id === "new";
  const router = useRouter();
  const toast = useToast();
  const [post, setPost] = useState<Draft | null>(isNew ? blank : null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [confirm, setConfirm] = useState(false);
  const localKey = `post-draft-${id}`;
  const restored = useRef(false);

  useEffect(() => {
    if (isNew) {
      try {
        const saved = localStorage.getItem(localKey);
        if (saved && !restored.current) { restored.current = true; setPost(JSON.parse(saved)); toast("Restored your unsaved draft"); }
      } catch {}
      return;
    }
    sb().from("posts").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error || !data) { toast("Couldn't find that post.", "error"); router.replace("/mrskadmin/blog"); return; }
      setPost(data as Post);
    });
  }, [id, isNew, localKey, router, toast]);

  // local autosave
  useEffect(() => {
    if (!post || !dirty) return;
    const t = setTimeout(() => { try { localStorage.setItem(localKey, JSON.stringify(post)); } catch {} }, 800);
    return () => clearTimeout(t);
  }, [post, dirty, localKey]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (patch: Partial<Draft>) => { setPost((p) => ({ ...p!, ...patch })); setDirty(true); };

  const save = async (status?: "draft" | "published") => {
    if (!post) return;
    if (!post.title.trim()) return toast("Give the post a title first.", "error");
    const slug = post.slug || slugify(post.title);
    const nextStatus = status ?? post.status;
    const published_at = nextStatus === "published" ? post.published_at || new Date().toISOString() : post.published_at;
    const payload = { ...post, slug, status: nextStatus, published_at };
    delete (payload as { id?: string }).id;
    delete (payload as { created_at?: string }).created_at;
    delete (payload as { updated_at?: string }).updated_at;
    setSaving(true);
    const res = post.id
      ? await sb().from("posts").update(payload).eq("id", post.id).select("id").single()
      : await sb().from("posts").insert(payload).select("id").single();
    setSaving(false);
    if (res.error) return toast(res.error.message.includes("duplicate") ? "That URL slug is taken — change it." : res.error.message, "error");
    setDirty(false);
    try { localStorage.removeItem(localKey); } catch {}
    setPost((p) => ({ ...p!, slug, status: nextStatus, published_at, id: res.data.id }));
    const future = published_at && new Date(published_at) > new Date();
    toast(nextStatus === "published" ? (future ? "Scheduled" : "Published — it's live") : "Draft saved");
    publishChanges();
    if (isNew) router.replace(`/mrskadmin/blog/${res.data.id}`);
  };

  const remove = async () => {
    if (!post?.id) return;
    const { error } = await sb().from("posts").delete().eq("id", post.id);
    if (error) return toast(error.message, "error");
    toast("Post deleted");
    publishChanges();
    router.replace("/mrskadmin/blog");
  };

  if (!post) return <div className="h-[600px] animate-pulse rounded-2xl bg-paper-2" />;
  const scheduled = post.status === "published" && post.published_at && new Date(post.published_at) > new Date();

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/mrskadmin/blog" className="font-mono text-xs uppercase tracking-[0.08em] text-muted hover:text-ink">← All posts</Link>
        <div className="flex items-center gap-2">
          <span className="chip !h-8 gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${post.status === "published" ? (scheduled ? "bg-warn" : "bg-success") : "bg-muted"}`} />
            {post.status === "published" ? (scheduled ? "Scheduled" : "Published") : "Draft"}{dirty ? " · unsaved" : ""}
          </span>
          {post.id && post.status === "published" && !scheduled && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-md">View ↗</a>}
          <button onClick={() => save("draft")} disabled={saving} className="btn btn-secondary btn-md">{post.status === "published" ? "Unpublish" : "Save draft"}</button>
          <button onClick={() => save("published")} disabled={saving} className="btn btn-primary btn-md">{saving ? "Saving…" : post.status === "published" ? "Update" : "Publish"}</button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <textarea
            value={post.title}
            onChange={(e) => { const title = e.target.value; set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) }); }}
            placeholder="Post title"
            rows={1}
            className="w-full resize-none bg-transparent text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.04em] outline-none placeholder:text-line"
            aria-label="Title"
          />
          <textarea value={post.excerpt ?? ""} onChange={(e) => set({ excerpt: e.target.value })} placeholder="A one-paragraph excerpt shown on the blog list…" rows={2}
            className="w-full resize-none bg-transparent text-lg text-ink-2 outline-none placeholder:text-muted/60" aria-label="Excerpt" />
          <RichEditor content={post.content_json || post.content_html} onChange={(html, json, words) => set({ content_html: html, content_json: json, reading_minutes: Math.max(1, Math.round(words / 220)) })} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Panel title="Publishing">
            <FieldRenderer field={{ name: "published_at", label: "Publish date", type: "date", help: "Set a future date to schedule.", half: true }} value={post.published_at} record={post} onChange={(v) => set({ published_at: v as string | null })} />
            <FieldRenderer field={{ name: "featured", label: "Featured post", type: "toggle", half: true }} value={post.featured} record={post} onChange={(v) => set({ featured: !!v })} />
          </Panel>
          <Panel title="Details">
            <div>
              <label className="field-label" htmlFor="p-slug">URL</label>
              <div className="flex items-center rounded-[10px] border border-line bg-card pl-3 font-mono text-xs text-muted focus-within:border-accent">
                /blog/<input id="p-slug" className="min-h-11 flex-1 bg-transparent pr-3 text-ink outline-none" value={post.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} />
              </div>
            </div>
            <FieldRenderer field={{ name: "tags", label: "Tags", type: "tags", half: true }} value={post.tags} record={post} onChange={(v) => set({ tags: v as string[] })} />
            <FieldRenderer field={{ name: "cover_url", label: "Cover image", type: "image", folder: "blog", half: true }} value={post.cover_url} record={post} onChange={(v) => set({ cover_url: (v as string) || null })} />
          </Panel>
          <Panel title="SEO">
            <FieldRenderer field={{ name: "seo_title", label: "SEO title", type: "text", half: true, help: `${(post.seo_title || post.title).length}/60` }} value={post.seo_title} record={post} onChange={(v) => set({ seo_title: v as string })} />
            <FieldRenderer field={{ name: "seo_description", label: "Meta description", type: "textarea", half: true, help: `${(post.seo_description || post.excerpt || "").length}/155` }} value={post.seo_description} record={post} onChange={(v) => set({ seo_description: v as string })} />
            <div className="rounded-xl border border-line p-4">
              <p className="truncate text-[15px] text-[#1a0dab]">{post.seo_title || post.title || "Post title"}</p>
              <p className="truncate text-xs text-success">yoursite.com/blog/{post.slug || "post-url"}</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-2">{post.seo_description || post.excerpt || "Description preview"}</p>
            </div>
          </Panel>
          {post.id && <button onClick={() => setConfirm(true)} className="btn btn-md w-full text-danger hover:bg-danger/10">Delete post</button>}
        </aside>
      </div>
      <ConfirmDelete name={confirm ? post.title : null} kind="post" onCancel={() => setConfirm(false)} onConfirm={remove} />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{title}</h2>
      {children}
    </section>
  );
}
