export type Social = { label: string; url: string };
export type Fact = { label: string; value: string };

export type SiteSettings = {
  name: string;
  shortName: string;
  initials: string;
  role: string;
  headline: string;
  headlineAccent: string;
  pitch: string;
  availability: string;
  available: boolean;
  location: string;
  timezone: string;
  email: string;
  phone: string;
  showPhone: boolean;
  github: string;
  linkedin: string;
  socials: Social[];
  avatarUrl: string;
  resumeUrl: string;
  bio: string[];
  facts: Fact[];
  hobbies: string[];
  likes: string[];
  dislikes: string[];
  languages: string[];
  lookingFor: string;
  marquee: string[];
  seoDescription: string;
  contactIntro: string;
};

type Row = { id: string; sort: number; published?: boolean; created_at?: string; updated_at?: string };

export type Project = Row & {
  slug: string;
  title: string;
  category: string | null;
  device: "web" | "mobile";
  summary: string | null;
  description: string | null;
  role: string | null;
  year: string | null;
  country: string | null;
  client: string | null;
  stack: string[];
  features: string[];
  live_url: string | null;
  repo_url: string | null;
  cover_url: string | null;
  gallery: string[];
  accent: string | null;
  featured: boolean;
};

export type Presence = Row & {
  country: string;
  title: string;
  kind: string | null;
  tech: string | null;
  url: string | null;
  description: string | null;
  project_slug: string | null;
};

export type Skill = Row & { category: string; name: string; level: number; used_in: string[] };

export type Experience = Row & {
  role: string;
  org: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string | null;
  bullets: string[];
  url: string | null;
};

export type Education = Row & {
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  grade: string | null;
  details: string | null;
};

export type Achievement = Row & {
  title: string;
  issuer: string | null;
  kind: string | null;
  date: string | null;
  url: string | null;
  description: string | null;
};

export type Tool = Row & {
  name: string;
  tagline: string | null;
  description: string | null;
  stack: string[];
  url: string | null;
  repo_url: string | null;
  status: string | null;
  cover_url: string | null;
  accent: string | null;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  content_json?: unknown;
  cover_url: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  reading_minutes: number;
  created_at?: string;
  updated_at?: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  purpose: string | null;
  company: string | null;
  message: string;
  read: boolean;
  archived: boolean;
  created_at: string;
};

export type SiteContent = {
  settings: SiteSettings;
  projects: Project[];
  presence: Presence[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  achievements: Achievement[];
  tools: Tool[];
  posts: Post[];
};
