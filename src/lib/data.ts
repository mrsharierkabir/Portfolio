import "server-only";
import { cache } from "react";
import { getPublicSupabase } from "./supabase/server";
import { seedContent, seedSettings } from "./seed";
import type {
  Achievement, Education, Experience, Post, Presence, Project, SiteContent, SiteSettings, Skill, Tool,
} from "./types";

async function list<T>(table: string, fallback: T[], order = "sort"): Promise<T[]> {
  const sb = getPublicSupabase();
  if (!sb) return fallback;
  const { data, error } = await sb.from(table).select("*").order(order, { ascending: true });
  if (error) {
    console.warn(`[data] ${table}: ${error.message} — using seed`);
    return fallback;
  }
  return (data ?? []) as T[];
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const sb = getPublicSupabase();
  if (!sb) return seedSettings;
  const { data, error } = await sb.from("site_settings").select("data").eq("id", 1).maybeSingle();
  if (error || !data) return seedSettings;
  return { ...seedSettings, ...(data.data as Partial<SiteSettings>) };
});

export const getProjects = cache(() => list<Project>("projects", seedContent.projects));
export const getPresence = cache(() => list<Presence>("presence", seedContent.presence));
export const getSkills = cache(() => list<Skill>("skills", seedContent.skills));
export const getExperience = cache(() => list<Experience>("experience", seedContent.experience));
export const getEducation = cache(() => list<Education>("education", seedContent.education));
export const getAchievements = cache(() => list<Achievement>("achievements", seedContent.achievements));
export const getTools = cache(() => list<Tool>("tools", seedContent.tools));

export const getPosts = cache(async (): Promise<Post[]> => {
  const sb = getPublicSupabase();
  if (!sb) return seedContent.posts;
  const { data, error } = await sb
    .from("posts")
    .select("id,slug,title,excerpt,cover_url,tags,status,published_at,featured,seo_title,seo_description,reading_minutes")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) return seedContent.posts;
  return (data ?? []) as Post[];
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const sb = getPublicSupabase();
  if (!sb) return seedContent.posts.find((p) => p.slug === slug) ?? null;
  const { data } = await sb.from("posts").select("*").eq("slug", slug).maybeSingle();
  return (data as Post) ?? null;
});

export const getProject = cache(async (slug: string) => {
  const all = await getProjects();
  return all.find((p) => p.slug === slug && p.published !== false) ?? null;
});

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const [settings, projects, presence, skills, experience, education, achievements, tools, posts] = await Promise.all([
    getSettings(), getProjects(), getPresence(), getSkills(), getExperience(), getEducation(), getAchievements(), getTools(), getPosts(),
  ]);
  const pub = <T extends { published?: boolean }>(xs: T[]) => xs.filter((x) => x.published !== false);
  return {
    settings,
    projects: pub(projects),
    presence: pub(presence),
    skills: pub(skills),
    experience: pub(experience),
    education: pub(education),
    achievements: pub(achievements),
    tools: pub(tools),
    posts,
  };
});
