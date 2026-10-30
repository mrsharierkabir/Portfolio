import type { Achievement, Education, Experience, SiteSettings } from "@/lib/types";
import SectionHeading from "../site/SectionHeading";
import Reveal from "../site/Reveal";
import Roll from "../site/Roll";
import LocalTime from "../site/LocalTime";
import Portrait from "./Portrait";

type Props = { s: SiteSettings; education: Education[]; experience: Experience[]; achievements: Achievement[] };

const range = (a: string | null, b: string | null, current: boolean) => [a, current ? "Present" : b].filter(Boolean).join(" — ");

export default function About({ s, education, experience, achievements }: Props) {
  const lists = [
    { title: "Hobbies", items: s.hobbies },
    { title: "I like", items: s.likes },
    { title: "I don't like", items: s.dislikes },
    { title: "Languages", items: s.languages },
  ].filter((l) => l.items.length);

  return (
    <section id="about" className="border-t border-line py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="04" eyebrow="About me" title={<>A builder who cares <span className="serif-accent">about the details.</span></>} />

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <Portrait name={s.name} initials={s.initials} avatarUrl={s.avatarUrl} location={s.location} />
            <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 font-mono text-xs text-muted">
              <span>Local time</span>
              <span className="text-ink"><LocalTime tz={s.timezone} /></span>
            </div>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal stagger={0.1} className="space-y-6">
              {s.bio.map((p, i) => (
                <p key={i} className={i === 0 ? "text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-ink" : "text-[1.05rem] leading-relaxed text-ink-2"}>{p}</p>
              ))}
            </Reveal>

            <Reveal stagger={0.06} className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {s.facts.map((f) => (
                <div key={f.label} className="bg-card p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{f.label}</p>
                  <p className="mt-2 font-medium text-ink">{f.value}</p>
                </div>
              ))}
            </Reveal>

            <Reveal className="mt-8 flex flex-wrap gap-3">
              {s.resumeUrl && <a href={s.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary"><Roll>Download CV</Roll><span aria-hidden>↓</span></a>}
              <a href="#contact" className="btn btn-secondary"><Roll>Get in touch</Roll></a>
            </Reveal>
          </div>
        </div>

        {/* timelines */}
        <div className="mt-24 grid gap-16 lg:grid-cols-2 lg:gap-12">
          <Timeline
            title="Education"
            items={education.map((e) => ({
              id: e.id, when: range(e.start_date, e.end_date, e.current), title: e.degree + (e.field ? ` in ${e.field}` : ""), org: e.institution,
              meta: e.grade, body: e.details, bullets: [], current: e.current,
            }))}
          />
          <Timeline
            title="Experience"
            items={experience.map((e) => ({
              id: e.id, when: range(e.start_date, e.end_date, e.current), title: e.role, org: [e.org, e.location].filter(Boolean).join(" · "),
              meta: null, body: e.description, bullets: e.bullets, current: e.current,
            }))}
          />
        </div>

        {achievements.length > 0 && (
          <div className="mt-24">
            <Reveal><p className="eyebrow">Certifications & achievements</p></Reveal>
            <Reveal stagger={0.06} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <a key={a.id} href={a.url ?? undefined} target={a.url ? "_blank" : undefined} rel="noreferrer" className="card block p-6 transition hover:-translate-y-0.5 hover:border-ink/30">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{[a.kind, a.date].filter(Boolean).join(" · ")}</p>
                  <p className="mt-3 text-lg font-medium text-ink">{a.title}</p>
                  {a.issuer && <p className="mt-1 text-sm text-muted">{a.issuer}</p>}
                  {a.description && <p className="mt-3 text-sm text-ink-2">{a.description}</p>}
                </a>
              ))}
            </Reveal>
          </div>
        )}

        {lists.length > 0 && (
          <Reveal stagger={0.08} className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lists.map((l) => (
              <div key={l.title} className="card p-6">
                <p className="eyebrow">{l.title}</p>
                <ul className="mt-5 space-y-2.5">
                  {l.items.map((x) => <li key={x} className="text-ink-2">{x}</li>)}
                </ul>
              </div>
            ))}
          </Reveal>
        )}

        {s.lookingFor && (
          <Reveal className="mt-16 rounded-2xl bg-ink p-8 text-paper md:flex md:items-center md:justify-between md:p-10">
            <div>
              <p className="eyebrow !text-white/50">What I&apos;m looking for</p>
              <p className="mt-3 text-2xl font-medium tracking-[-0.02em]">{s.lookingFor}</p>
            </div>
            <a href="#contact" className="btn mt-6 bg-white text-ink md:mt-0"><Roll>Start a conversation</Roll><span aria-hidden>→</span></a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

type TItem = { id: string; when: string; title: string; org: string; meta: string | null; body: string | null; bullets: string[]; current: boolean };

function Timeline({ title, items }: { title: string; items: TItem[] }) {
  if (!items.length) return null;
  return (
    <div>
      <Reveal><p className="eyebrow">{title}</p></Reveal>
      <ol className="relative mt-8 border-l border-line">
        {items.map((it) => (
          <Reveal as="li" key={it.id} className="relative pb-10 pl-8 last:pb-0">
            <span className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-paper ${it.current ? "bg-accent" : "bg-ink"}`} />
            <p className="font-mono text-xs text-muted">{it.when}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">{it.title}</h3>
            <p className="mt-1 text-ink-2">{it.org}</p>
            {it.meta && <p className="mt-2 inline-block rounded-full bg-paper-2 px-3 py-1 font-mono text-xs text-ink-2">{it.meta}</p>}
            {it.body && <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{it.body}</p>}
            {it.bullets.length > 0 && (
              <ul className="mt-3 space-y-2">
                {it.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-[0.95rem] text-ink-2"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-muted" />{b}</li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
