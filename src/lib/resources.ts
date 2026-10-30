/**
 * Admin schemas. Each resource maps to a Supabase table and describes its form.
 * Add a field here (and to schema.sql / types.ts) to make it editable.
 */
export type FieldType =
  | "text" | "textarea" | "number" | "url" | "toggle" | "select" | "tags" | "lines" | "image" | "images"
  | "file" | "color" | "country" | "slug" | "range" | "project" | "projects" | "pairs" | "date";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  from?: string;        // slug source
  folder?: string;      // upload folder
  accept?: string;      // file types
  pairKeys?: [string, string]; // for pairs
  half?: boolean;       // half-width in form grid
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  titleField: string;
  subtitle?: (row: Record<string, unknown>) => string;
  fields: Field[];
  defaults: Record<string, unknown>;
  publishable?: boolean;
};

const sortField: Field = { name: "sort", label: "Order", type: "number", help: "Lower numbers show first.", half: true };
const pubField: Field = { name: "published", label: "Visible on site", type: "toggle", half: true };

export const RESOURCES: Record<string, Resource> = {
  projects: {
    key: "projects", table: "projects", label: "Projects", singular: "project", publishable: true,
    description: "Case studies. Featured projects appear in the 3D showcase on the home page.",
    titleField: "title",
    subtitle: (r) => [r.category, r.country].filter(Boolean).join(" · "),
    defaults: { device: "web", stack: [], features: [], gallery: [], featured: true, published: true, sort: 10, accent: "#2F45FF" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "slug", label: "URL slug", type: "slug", from: "title", required: true, half: true, help: "Used in /projects/your-slug" },
      { name: "category", label: "Category", type: "text", placeholder: "E-commerce · Client project", half: true },
      { name: "device", label: "Device frame", type: "select", options: ["web", "mobile"], half: true, help: "Browser or phone in the 3D showcase." },
      { name: "summary", label: "Summary", type: "textarea", help: "One or two sentences shown in the showcase and cards.", required: true },
      { name: "description", label: "Case study", type: "textarea", help: "Full write-up. Leave a blank line between paragraphs." },
      { name: "role", label: "Your role", type: "text", half: true },
      { name: "year", label: "Year", type: "text", half: true, placeholder: "2025" },
      { name: "client", label: "Client", type: "text", half: true },
      { name: "country", label: "Country", type: "country", half: true, help: "Also add it under Reach & Presence to show on the globe." },
      { name: "stack", label: "Tech stack", type: "tags", placeholder: "Type and press Enter" },
      { name: "features", label: "Key features", type: "lines", help: "One per line." },
      { name: "live_url", label: "Live URL", type: "url", half: true },
      { name: "repo_url", label: "Repository URL", type: "url", half: true },
      { name: "cover_url", label: "Cover / main screenshot", type: "image", folder: "projects", help: "16:10 for web, 9:19 for mobile. Without one, a generated mock-up is used." },
      { name: "gallery", label: "Gallery", type: "images", folder: "projects" },
      { name: "accent", label: "Accent colour", type: "color", half: true },
      { name: "featured", label: "Featured in 3D showcase", type: "toggle", half: true },
      sortField, pubField,
    ],
  },
  presence: {
    key: "presence", table: "presence", label: "Reach & Presence", singular: "entry", publishable: true,
    description: "Every entry adds one project to a country on the globe.",
    titleField: "title",
    subtitle: (r) => [r.country, r.kind, r.tech].filter(Boolean).join(" · "),
    defaults: { published: true, sort: 10, country: "Bangladesh" },
    fields: [
      { name: "country", label: "Country", type: "country", required: true, half: true },
      { name: "title", label: "Project name", type: "text", required: true, half: true },
      { name: "kind", label: "Type", type: "text", placeholder: "E-commerce website", half: true },
      { name: "tech", label: "Tech", type: "text", placeholder: "React", half: true },
      { name: "url", label: "Link", type: "url", half: true },
      { name: "project_slug", label: "Linked case study", type: "project", half: true, help: "Optional — opens the case study from the globe." },
      { name: "description", label: "Short description", type: "textarea" },
      sortField, pubField,
    ],
  },
  skills: {
    key: "skills", table: "skills", label: "Skills", singular: "skill", publishable: true,
    description: "Grouped by category on the home page.",
    titleField: "name",
    subtitle: (r) => `${r.category} · ${r.level}%`,
    defaults: { level: 70, used_in: [], published: true, sort: 10, category: "Frontend" },
    fields: [
      { name: "name", label: "Skill", type: "text", required: true, half: true },
      { name: "category", label: "Category", type: "text", required: true, half: true, help: "e.g. Frontend, Backend & Data, Mobile" },
      { name: "level", label: "Level", type: "range", help: "80+ = Advanced, 60+ = Proficient, else Familiar" },
      { name: "used_in", label: "Used in projects", type: "projects" },
      sortField, pubField,
    ],
  },
  experience: {
    key: "experience", table: "experience", label: "Experience", singular: "role", publishable: true,
    description: "Jobs, internships, freelance and independent work.",
    titleField: "role",
    subtitle: (r) => [r.org, r.start_date && `${r.start_date} — ${r.current ? "Present" : r.end_date ?? ""}`].filter(Boolean).join(" · "),
    defaults: { bullets: [], current: false, published: true, sort: 10 },
    fields: [
      { name: "role", label: "Role", type: "text", required: true, half: true },
      { name: "org", label: "Organisation", type: "text", required: true, half: true },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "url", label: "Link", type: "url", half: true },
      { name: "start_date", label: "Start", type: "text", placeholder: "2023 or Jan 2023", half: true },
      { name: "end_date", label: "End", type: "text", half: true },
      { name: "current", label: "I currently work here", type: "toggle" },
      { name: "description", label: "Summary", type: "textarea" },
      { name: "bullets", label: "Highlights", type: "lines", help: "One achievement per line — start with a verb." },
      sortField, pubField,
    ],
  },
  education: {
    key: "education", table: "education", label: "Education", singular: "entry", publishable: true,
    description: "Degrees, schools and courses.",
    titleField: "institution",
    subtitle: (r) => [r.degree, r.grade].filter(Boolean).join(" · "),
    defaults: { current: false, published: true, sort: 10 },
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "degree", label: "Degree", type: "text", required: true, half: true },
      { name: "field", label: "Field of study", type: "text", half: true },
      { name: "start_date", label: "Start", type: "text", half: true },
      { name: "end_date", label: "End", type: "text", half: true },
      { name: "grade", label: "Grade / CGPA", type: "text", half: true, placeholder: "CGPA 3.00 / 4.00" },
      { name: "current", label: "Currently studying", type: "toggle", half: true },
      { name: "details", label: "Details", type: "textarea", help: "Relevant coursework, thesis, clubs…" },
      sortField, pubField,
    ],
  },
  achievements: {
    key: "achievements", table: "achievements", label: "Achievements", singular: "achievement", publishable: true,
    description: "Certifications, awards, competitions. The section hides itself when empty.",
    titleField: "title",
    subtitle: (r) => [r.kind, r.issuer, r.date].filter(Boolean).join(" · "),
    defaults: { kind: "Certification", published: true, sort: 10 },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "kind", label: "Type", type: "select", options: ["Certification", "Award", "Competition", "Publication", "Course"], half: true },
      { name: "issuer", label: "Issuer", type: "text", half: true },
      { name: "date", label: "Date", type: "text", half: true },
      { name: "url", label: "Credential URL", type: "url", half: true },
      { name: "description", label: "Description", type: "textarea" },
      sortField, pubField,
    ],
  },
  tools: {
    key: "tools", table: "tools", label: "Tools", singular: "tool", publishable: true,
    description: "Your own apps — shown in the Tools section.",
    titleField: "name",
    subtitle: (r) => [r.status, (r.stack as string[] | undefined)?.join(", ")].filter(Boolean).join(" · "),
    defaults: { stack: [], status: "Live", published: true, sort: 10, accent: "#2F45FF" },
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true },
      { name: "status", label: "Status", type: "select", options: ["Live", "Beta", "In progress"], half: true },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "stack", label: "Stack", type: "tags" },
      { name: "url", label: "Live URL", type: "url", half: true },
      { name: "repo_url", label: "Repository URL", type: "url", half: true },
      { name: "cover_url", label: "Screenshot", type: "image", folder: "tools" },
      { name: "accent", label: "Accent colour", type: "color", half: true },
      sortField, pubField,
    ],
  },
};

/** Site settings form (single row in site_settings.data). */
export const SETTINGS_GROUPS: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Identity", description: "Who you are — used across the whole site and SEO.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, half: true },
      { name: "shortName", label: "Short name", type: "text", half: true },
      { name: "initials", label: "Initials (logo)", type: "text", half: true },
      { name: "role", label: "Role / title", type: "text", half: true },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "timezone", label: "Time zone (IANA)", type: "text", half: true, placeholder: "Asia/Dhaka" },
    ],
  },
  {
    title: "Hero", description: "The first thing recruiters read.",
    fields: [
      { name: "headline", label: "Headline", type: "text", help: "Shown in bold." },
      { name: "headlineAccent", label: "Headline accent", type: "text", help: "Shown in italic serif after the headline." },
      { name: "pitch", label: "Pitch", type: "textarea" },
      { name: "available", label: "Show 'available' badge", type: "toggle", half: true },
      { name: "availability", label: "Availability text", type: "text", half: true },
      { name: "marquee", label: "Marquee items", type: "lines", help: "One per line." },
    ],
  },
  {
    title: "Contact", description: "How people reach you.",
    fields: [
      { name: "email", label: "Email", type: "text", half: true },
      { name: "phone", label: "Phone", type: "text", half: true },
      { name: "showPhone", label: "Show phone publicly", type: "toggle" },
      { name: "github", label: "GitHub URL", type: "url", half: true },
      { name: "linkedin", label: "LinkedIn URL", type: "url", half: true },
      { name: "socials", label: "Social links", type: "pairs", pairKeys: ["label", "url"], help: "Shown in contact and footer." },
      { name: "contactIntro", label: "Contact intro", type: "textarea" },
    ],
  },
  {
    title: "Media", description: "Photo and résumé.",
    fields: [
      { name: "avatarUrl", label: "Portrait photo", type: "image", folder: "profile", help: "4:5 works best. Empty = monogram card." },
      { name: "resumeUrl", label: "Résumé (PDF)", type: "file", folder: "resume", accept: "application/pdf" },
    ],
  },
  {
    title: "About", description: "Your story and personal details.",
    fields: [
      { name: "bio", label: "Bio paragraphs", type: "lines", help: "One paragraph per line. The first is shown large." },
      { name: "facts", label: "Quick facts", type: "pairs", pairKeys: ["label", "value"] },
      { name: "hobbies", label: "Hobbies", type: "lines", half: true },
      { name: "languages", label: "Languages", type: "lines", half: true },
      { name: "likes", label: "Likes", type: "lines", half: true },
      { name: "dislikes", label: "Dislikes", type: "lines", half: true },
      { name: "lookingFor", label: "What you're looking for", type: "text" },
    ],
  },
  {
    title: "SEO", description: "How the site appears on Google and when shared.",
    fields: [{ name: "seoDescription", label: "Meta description", type: "textarea", help: "~155 characters." }],
  },
];
