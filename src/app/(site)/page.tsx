import Hero from "@/components/hero/Hero";
import Preloader from "@/components/site/Preloader";
import Marquee from "@/components/site/Marquee";
import ProjectsShowcase from "@/components/projects/ProjectsShowcase";
import ReachPresence from "@/components/globe/ReachPresence";
import Skills from "@/components/sections/Skills";
import About from "@/components/sections/About";
import Tools from "@/components/sections/Tools";
import BlogPreview from "@/components/sections/BlogPreview";
import Contact from "@/components/sections/Contact";
import { getSiteContent } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

export default async function Home() {
  const c = await getSiteContent();
  const s = c.settings;
  const featured = c.projects.filter((p) => p.featured);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: s.role,
    email: `mailto:${s.email}`,
    url: siteUrl(),
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    alumniOf: c.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: c.skills.map((k) => k.name),
    sameAs: s.socials.map((x) => x.url),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Preloader name={s.name} />
      <Hero s={s} stack={["React", "Next.js", "Supabase"]} />
      <div className="py-16 md:py-24"><Marquee items={s.marquee} /></div>
      <ProjectsShowcase projects={featured.length ? featured : c.projects} />
      <ReachPresence presence={c.presence} />
      <Skills skills={c.skills} projects={c.projects} />
      <About s={s} education={c.education} experience={c.experience} achievements={c.achievements} />
      <Tools tools={c.tools} />
      <BlogPreview posts={c.posts} />
      <Contact s={s} />
    </>
  );
}
