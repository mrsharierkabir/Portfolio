"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Briefcase, ExternalLink, FolderKanban, Globe, GraduationCap, Inbox, LayoutDashboard, LogOut, Menu, PenLine, Sparkles, User, Wrench, X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const NAV = [
  { href: "/mrskadmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mrskadmin/profile", label: "Profile & site", icon: User },
  { group: "Content" },
  { href: "/mrskadmin/projects", label: "Projects", icon: FolderKanban },
  { href: "/mrskadmin/presence", label: "Reach & Presence", icon: Globe },
  { href: "/mrskadmin/skills", label: "Skills", icon: Sparkles },
  { href: "/mrskadmin/experience", label: "Experience", icon: Briefcase },
  { href: "/mrskadmin/education", label: "Education", icon: GraduationCap },
  { href: "/mrskadmin/achievements", label: "Achievements", icon: Award },
  { href: "/mrskadmin/tools", label: "Tools", icon: Wrench },
  { group: "Publishing" },
  { href: "/mrskadmin/blog", label: "Blog", icon: PenLine },
  { href: "/mrskadmin/messages", label: "Messages", icon: Inbox },
] as const;

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await getBrowserSupabase()?.auth.signOut();
    router.replace("/mrskadmin");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3" aria-label="Admin">
      {NAV.map((n, i) =>
        "group" in n ? (
          <p key={i} className="mb-1 mt-5 px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{n.group}</p>
        ) : (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${path.startsWith(n.href) ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}
            aria-current={path.startsWith(n.href) ? "page" : undefined}>
            <n.icon size={16} strokeWidth={1.75} />{n.label}
          </Link>
        ),
      )}
    </nav>
  );

  const side = (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/mrskadmin/dashboard" className="font-serif text-2xl italic">mrsk</Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Studio</span>
      </div>
      {nav}
      <div className="space-y-1 border-t border-line p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-paper-2"><ExternalLink size={16} />View site</a>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-paper-2"><LogOut size={16} />Sign out</button>
        <p className="truncate px-3 pt-2 font-mono text-[10px] text-muted">{email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-line lg:block">{side}</aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-serif text-xl italic">mrsk</span>
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Open menu"><Menu size={18} /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-[var(--shadow-lift)]">
            {side}
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full border border-line bg-card" aria-label="Close menu"><X size={16} /></button>
          </div>
        </div>
      )}
      <main className="px-4 py-8 md:px-10 lg:ml-[248px] lg:py-12">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
