"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb } from "./client";

type Stats = { projects: number; posts: number; drafts: number; unread: number; countries: number; skills: number };

export default function Dashboard({ email }: { email: string }) {
  const [s, setS] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<{ id: string; name: string; purpose: string | null; created_at: string; read: boolean }[]>([]);
  useEffect(() => {
    (async () => {
      const c = sb();
      const head = { count: "exact" as const, head: true };
      const [projectsR, postsR, draftsR, unreadR, skillsR, pres] = await Promise.all([
        c.from("projects").select("id", head),
        c.from("posts").select("id", head).eq("status", "published"),
        c.from("posts").select("id", head).eq("status", "draft"),
        c.from("messages").select("id", head).eq("read", false).eq("archived", false),
        c.from("skills").select("id", head),
        c.from("presence").select("country"),
      ]);
      const projects = projectsR.count ?? 0, posts = postsR.count ?? 0, drafts = draftsR.count ?? 0, unread = unreadR.count ?? 0, skills = skillsR.count ?? 0;
      const countries = new Set(((pres.data as { country: string }[]) ?? []).map((x) => x.country)).size;
      setS({ projects, posts, drafts, unread, countries, skills });
      const { data } = await c.from("messages").select("id,name,purpose,created_at,read").order("created_at", { ascending: false }).limit(5);
      setRecent((data as typeof recent) ?? []);
    })();
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const cards = [
    { label: "Projects", v: s?.projects, href: "/mrskadmin/projects" },
    { label: "Countries on globe", v: s?.countries, href: "/mrskadmin/presence" },
    { label: "Published posts", v: s?.posts, href: "/mrskadmin/blog", sub: s ? `${s.drafts} drafts` : "" },
    { label: "Unread messages", v: s?.unread, href: "/mrskadmin/messages", accent: true },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{email}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{greet}, Sharier.</h1>
      <p className="mt-2 text-ink-2">Here&apos;s your site at a glance. Every change you save goes live within seconds.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-2xl border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{c.label}</p>
            <p className={`mt-4 text-5xl font-semibold tabular-nums tracking-[-0.04em] ${c.accent && s?.unread ? "text-accent" : ""}`}>{s ? String(c.v ?? 0).padStart(2, "0") : "··"}</p>
            {c.sub && <p className="mt-2 text-sm text-muted">{c.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest messages</h2>
            <Link href="/mrskadmin/messages" className="text-sm text-muted hover:text-ink">Open inbox →</Link>
          </div>
          {recent.length === 0 ? <p className="mt-6 text-sm text-muted">No messages yet.</p> : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${m.read ? "bg-line" : "bg-accent"}`} /><span className={m.read ? "" : "font-semibold"}>{m.name}</span><span className="text-muted">{m.purpose}</span></span>
                  <span className="font-mono text-xs text-muted">{new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/mrskadmin/blog/new" className="btn btn-primary btn-md justify-start">+ Write a post</Link>
            <Link href="/mrskadmin/projects?new=1" className="btn btn-secondary btn-md justify-start">+ Add a project</Link>
            <Link href="/mrskadmin/presence?new=1" className="btn btn-secondary btn-md justify-start">+ Add a country entry</Link>
            <Link href="/mrskadmin/profile" className="btn btn-secondary btn-md justify-start">Update CV & profile</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
