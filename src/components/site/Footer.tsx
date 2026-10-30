import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import LocalTime from "./LocalTime";
import Roll from "./Roll";

export default function Footer({ s }: { s: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-ink text-paper" data-theme="dark">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow !text-white/50">Got a role or a project?</p>
            <a href={`mailto:${s.email}`} className="mt-6 block text-[clamp(2rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              <span className="link-u">{s.email}</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-4 md:col-start-9">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-white/40">Sitemap</p>
              <ul className="space-y-2.5 text-white/80">
                {[["/#work", "Work"], ["/#reach", "Reach"], ["/#about", "About"], ["/projects", "All projects"], ["/blog", "Blog"], ["/#contact", "Contact"]].map(([h, l]) => (
                  <li key={h}><Link href={h} className="hover:text-white"><Roll>{l}</Roll></Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-white/40">Elsewhere</p>
              <ul className="space-y-2.5 text-white/80">
                {s.socials.map((x) => (
                  <li key={x.url}><a href={x.url} target="_blank" rel="noreferrer" className="hover:text-white"><Roll>{x.label}</Roll></a></li>
                ))}
                {s.resumeUrl && <li><a href={s.resumeUrl} target="_blank" rel="noreferrer" className="hover:text-white"><Roll>Résumé</Roll></a></li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 font-mono text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <span>© {year} {s.name}</span>
          <span>{s.location} · <LocalTime tz={s.timezone} /></span>
          <a href="#top" className="hover:text-white">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
