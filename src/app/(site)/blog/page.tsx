import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import SplitReveal from "@/components/site/SplitReveal";
import BlogList from "./BlogList";

export const revalidate = 120;
export const metadata: Metadata = { title: "Blog", description: "Notes on building web and mobile products.", alternates: { canonical: "/blog" } };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="container-x pb-28 pt-36 md:pt-44">
      <p className="eyebrow">Writing</p>
      <SplitReveal as="h1" immediate className="display mt-6 max-w-4xl text-[clamp(2.75rem,7vw,6rem)]">
        Notes from <span className="serif-accent">the desk.</span>
      </SplitReveal>
      <p className="mt-8 max-w-xl text-lg text-ink-2">What I learn while building — databases, interfaces, performance and shipping.</p>
      <BlogList posts={posts} />
    </div>
  );
}
