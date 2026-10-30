"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { sb } from "./client";
import { useToast } from "./Toast";

type F = "all" | "published" | "scheduled" | "draft";

export default function PostList() {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [f, setF] = useState<F>("all");
  useEffect(() => {
    sb().from("posts").select("id,slug,title,excerpt,status,published_at,updated_at,tags,cover_url,featured,reading_minutes").order("updated_at", { ascending: false })
      .then(({ data, error }) => { if (error) toast(error.message, "error"); setPosts((data as Post[]) ?? []); });
  }, [toast]);
  const state = (p: Post): Exclude<F, "all"> => (p.status === "draft" ? "draft" : p.published_at && new Date(p.published_at) > new Date() ? "scheduled" : "published");
  const list = useMemo(() => (posts ?? []).filter((p) => f === "all" || state(p) === f), [posts, f]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Blog</h1>
          <p className="mt-2 text-ink-2">Write, schedule and publish posts.</p>
        </div>
        <Link href="/mrskadmin/blog/new" className="btn btn-primary btn-md">+ New post</Link>
      </div>
      <div className="mt-8 flex gap-2" role="tablist">
        {(["all", "published", "scheduled", "draft"] as F[]).map((x) => (
          <button key={x} role="tab" aria-selected={f === x} onClick={() => setF(x)} className={`chip !h-9 !px-4 capitalize ${f === x ? "!border-ink bg-ink !text-paper" : "bg-card"}`}>
            {x} <span className="ml-1.5 opacity-60">{(posts ?? []).filter((p) => x === "all" || state(p) === x).length}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
        {posts === null ? <div className="h-48 animate-pulse bg-paper-2/60" /> : list.length === 0 ? (
          <div className="flex flex-col items-start gap-4 p-10">
            <p className="text-lg font-medium">{f === "all" ? "No posts yet." : `No ${f} posts.`}</p>
            <Link href="/mrskadmin/blog/new" className="btn btn-primary btn-md">Write your first post</Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((p) => {
              const s = state(p);
              return (
                <li key={p.id}>
                  <Link href={`/mrskadmin/blog/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper/60">
                    {p.cover_url ? <img src={p.cover_url} alt="" className="h-12 w-16 rounded-md border border-line object-cover" /> : <span className="h-12 w-16 rounded-md bg-paper-2" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.title || "Untitled"}</span>
                      <span className="block truncate text-sm text-muted">{s === "draft" ? `Edited ${formatDate(p.updated_at)}` : `${s === "scheduled" ? "Goes live" : "Published"} ${formatDate(p.published_at)}`} · {p.reading_minutes} min</span>
                    </span>
                    <span className="chip !h-7 gap-1.5 capitalize"><span className={`h-1.5 w-1.5 rounded-full ${s === "published" ? "bg-success" : s === "scheduled" ? "bg-warn" : "bg-muted"}`} />{s}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
