import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...projects.filter((p) => p.published !== false).map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updated_at, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updated_at ?? p.published_at ?? undefined, priority: 0.6 })),
  ];
}
